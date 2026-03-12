import { Plus, ChevronDown, ChevronUp, X, Pencil, Bell, IndentIcon, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import ModalClients from "./ModalClients";

export function DisplayClients() {
    const [isOpen, setIsOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [data, setData] = useState([])
    const [devices, setDevices] = useState([])
    const [sortKey, setSortKey] = useState(null)
    const [sortDir, setSortDir] = useState(0)
    const [originalData, setOriginalData] = useState([])

    const [newClient, setNewClient] = useState({
        name: "", number: "", device: "", checkoutDate: "",
        duration: 1, guaranteed: false, Amount: "", status: "still"
    })

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-clients').then((d) => {
            setData(d);
            setOriginalData(d);
        })
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
    }, [])

    function getStatus(duedate) {
        const date = new Date(duedate);
        date.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today > date) {
            return "due"
        }
        return "still";
    }

    async function saveClient(statusOverride = null) {
        const clientToSave = statusOverride ? { ...newClient, status: statusOverride } : newClient;

        if (editIndex === null) {
            await window.electron.ipcRenderer.invoke('add-client', clientToSave)
            await window.electron.ipcRenderer.invoke('update-device-status', clientToSave.device, 'in-use')
        } else {
            await window.electron.ipcRenderer.invoke('update-client', editIndex, clientToSave)
            if (clientToSave.status === "done") {
                await window.electron.ipcRenderer.invoke('update-device-status', clientToSave.device, 'available')
            } else {
                await window.electron.ipcRenderer.invoke('update-device-status', clientToSave.device, 'in-use')
            }
        }
        window.electron.ipcRenderer.invoke('get-clients').then((d) => {
            setData(d)
            setOriginalData(d)
        })
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
        setIsOpen(false)
    }

    async function deleteClient(index) {
        const client = data[index]
        await window.electron.ipcRenderer.invoke('delete-client', index)
        await window.electron.ipcRenderer.invoke('update-device-status', client.device, 'available')
        window.electron.ipcRenderer.invoke('get-clients').then(setData)
        window.electron.ipcRenderer.invoke('get-clients').then((d) => {
            setData(d)
            setOriginalData(d)  // ← missing
        })
    }

    function channgedisplay(basedOn) {
        if (sortKey === basedOn) {
            if (sortDir === 0) setSortDir(1)
            else if (sortDir === 1) setSortDir(-1)
            else { setSortDir(0); setSortKey(null) }
        } else {
            setSortKey(basedOn)
            setSortDir(1)
        }

    }
    const displayData = sortKey === null ? originalData : [...data].sort((a, b) => {
        switch (sortKey) {
            case "name": return a.name.localeCompare(b.name) * sortDir
            case "checkoutdate": return (new Date(a.checkoutDate) - new Date(b.checkoutDate)) * sortDir
            case "duedate": return (new Date(calculateDueDate(a.checkoutDate, a.duration)) - new Date(calculateDueDate(b.checkoutDate, b.duration))) * sortDir
            case "status": return a.status.localeCompare(b.status) * sortDir
        }
    })

    function calculateDueDate(checkoutDate, duration) {
        if (!checkoutDate) return "N/A"
        const date = new Date(checkoutDate)
        if (isNaN(date.getTime())) return "N/A"
        date.setDate(date.getDate() + Number(duration) + 1)
        return date.toISOString().split('T')[0]
    }

    function calculateDevices() {
        return data.filter(c => c.status !== "done").length
    }
    function calculateAvailable() {
        return devices.filter(d => d.status === "available").length
    }

    const STATUS = {
        STILL: "still",
        DUE: "due",
        DONE: "done"
    }
    const statusStyles = {
        still: "bg-gray-100 text-gray-600 shadow-gray-400",
        due: "bg-red-100 text-red-600 shadow-red-300",
        done: "bg-green-100 text-green-600 shadow-green-300",
    }
    function handleSave() {
        onClose();
    }

    return (<>


        <div id="stats" className="w-full h-auto flex flex-row items-center justify-center">
            <div className="card ">Devices in use : {calculateDevices()}</div>
            <div className="card">Devices Available : {calculateAvailable()}</div>
            <div className="flex justify-end mx-2 h-full">
                <div onClick={() => {
                    setNewClient({ name: "", number: "", device: "", checkoutDate: "", duration: 1, guaranteed: false, Amount: "", status: "still" })
                    setEditIndex(null)
                    setIsOpen(true)
                }} className="flex items-center  gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-indigo-500">
                    <Plus size={16} /><span>Add New</span>
                </div>
            </div>
        </div>

        <ModalClients isOpen={isOpen} onClose={() => setIsOpen(false)} title={`${editIndex === null ? "Add Cew Client" : "Update Client"}`}>
            <div className="flex flex-col gap-4">
                <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Name" />
                <input value={newClient.number} onChange={(e) => setNewClient({ ...newClient, number: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Phone number" />

                <select value={newClient.device} onChange={(e) => setNewClient({ ...newClient, device: e.target.value })} className="border appearance-none border-gray-200 rounded-lg p-2 text-sm text-gray-600">
                    <option value="">Select Device</option>
                    {devices.filter(d => d.status === "available").map((device, index) => (
                        <option key={index} value={device.id}>{device.id}</option>
                    ))}
                </select>
                <input value={newClient.checkoutDate} onChange={(e) => setNewClient({ ...newClient, checkoutDate: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="Checkout Date" type="date" />
                <div className="flex justify-between items-baseline">
                    <label htmlFor="duration">Duration : ( days )</label>
                    <input value={newClient.duration} onChange={(e) => setNewClient({ ...newClient, duration: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm " type="number" placeholder="duration" min={"1"} id="duration" />
                </div>
                <input value={newClient.Amount} onChange={(e) => setNewClient({ ...newClient, Amount: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="Paid Amount" type="number" id="duration" />


                <div className=" flex text-base  px-2  ">
                    <input checked={newClient.guaranteed} onChange={(e) => setNewClient({ ...newClient, guaranteed: e.target.checked })} className="scale-150 cursor-pointer accent-indigo-400" type="checkbox" id="insured" />
                    <label className=" ml-4" htmlFor="insured">did the client pay the insurance ( 2000 DA)</label>
                </div>
                <div className="flex gap-5">
                    {editIndex === null ?
                        <>
                            <button
                                onClick={() => { saveClient(); setIsOpen(false) }}
                                className="bg-indigo-400 flex-1 text-white rounded-lg py-2 hover:bg-indigo-500">
                                {editIndex === null ? "Save" : "Update"}
                            </button>
                        </> :
                        newClient.status === "done" ?
                            <>
                                <button
                                    onClick={() => { saveClient("still"); setIsOpen(false) }}
                                    className="bg-red-400 flex-1 text-white rounded-lg py-2 hover:bg-red-500">
                                    Uncheck
                                </button>
                                <button
                                    onClick={() => { saveClient(); setIsOpen(false) }}
                                    className="bg-indigo-400 flex-1 text-white rounded-lg py-2 hover:bg-indigo-500">
                                    {editIndex === null ? "Save" : "Update"}
                                </button>
                            </> :
                            <>
                                <button
                                    onClick={() => { saveClient("done"); setIsOpen(false) }}
                                    className="bg-green-400 flex-1 text-white rounded-lg py-2 hover:bg-green-500">
                                    Device returned
                                </button>
                                <button
                                    onClick={() => { saveClient(); setIsOpen(false) }}
                                    className="bg-indigo-400 flex-1 text-white rounded-lg py-2 hover:bg-indigo-500">
                                    {editIndex === null ? "Save" : "Update"}
                                </button>
                            </>
                    }
                </div>
            </div>
        </ModalClients>

        <div style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }} className="grid mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
            <div onClick={() => channgedisplay("name")} className="col-span-2 flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Name</p> {sortKey === "name"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-2 flex items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Number</p>
            </div>
            <div className="col-span-3 flex  items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Device</p>
            </div>
            <div onClick={() => channgedisplay("checkoutdate")} className="col-span-2 flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Checkout</p>{sortKey === "checkoutdate"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-1 flex justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Duration</p>
            </div>
            <div onClick={() => channgedisplay("duedate")} className="col-span-2 flex items-center justify-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Due</p>{sortKey === "duedate"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-2 flex justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Guaranteed</p>
            </div>

            <div className="col-span-1 flex  justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Amount</p>
            </div>
            <div onClick={() => channgedisplay("status")} className="col-span-1 flex  items-center justify-center cursor-pointer  text-sm font-semibold text-gray-600">
                {sortKey === "status"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-1" />
        </div>

        <div className="flex flex-col mx-2 mt-1">
            {displayData.map((item) => {
                const currentstatus = item.status === "done" ? "done" : getStatus(calculateDueDate(item.checkoutDate, item.duration));

                return (<div key={item.name + item.number} className="grid grid-cols-17 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-800 col-span-2 px-1">{item.name}</p>
                    <p className="text-sm text-gray-800 col-span-2">{item.number}</p>
                    <p className="text-sm text-gray-800 col-span-3">{item.device}</p>
                    <p className="text-sm text-gray-800 col-span-2">{item.checkoutDate}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.duration}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center">    {calculateDueDate(item.checkoutDate, item.duration)}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center ">{item.guaranteed.toString()}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.Amount}</p>
                    <div className="col-span-1 flex items-start justify-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full shadow-md ${statusStyles[currentstatus]}`}>
                            {currentstatus}
                        </span>
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                        <Pencil onClick={() => {
                            const Index = data.findIndex(d => d.name === item.name && d.number === item.number)

                            setNewClient(item)
                            setEditIndex(Index)
                            setIsOpen(true)
                        }} className="text-indigo-500 w-4  cursor-pointer hover:text-indigo-800" />
                        <X onClick={() => {
                            const Index = data.findIndex(d => d.name === item.name && d.number === item.number)

                            deleteClient(Index);
                        }} className="text-red-400  cursor-pointer hover:text-red-700" />
                    </div>
                </div>
                )
            })}
        </div>


    </>);
}
