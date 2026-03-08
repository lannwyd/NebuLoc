import { Plus, ChevronDown, ChevronUp, X, Pencil, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import ModalClients from "./ModalClients";

export function DisplayClients() {
    const [isOpen, setIsOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [data, setData] = useState([])
    const [devices, setDevices] = useState([])
    const [newClient, setNewClient] = useState({
        name: "", number: "", device: "", checkoutDate: "",
        duration: 1, guaranteed: false, Amount: 0, status: "still"
    })

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-clients').then(setData)
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
    }, [])

    async function saveClient() {
        if (editIndex === null) {
            await window.electron.ipcRenderer.invoke('add-client', newClient)
            await window.electron.ipcRenderer.invoke('update-device-status', newClient.device, 'in-use')
        } else {
            await window.electron.ipcRenderer.invoke('update-client', editIndex, newClient)
        }
        window.electron.ipcRenderer.invoke('get-clients').then(setData)
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
        setIsOpen(false)
    }

    async function deleteClient(index) {
        const client = data[index]
        await window.electron.ipcRenderer.invoke('delete-client', index)
        await window.electron.ipcRenderer.invoke('update-device-status', client.device, 'available')
        window.electron.ipcRenderer.invoke('get-clients').then(setData)
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
    }

    function calculateDueDate(checkoutDate, duration) {
        const date = new Date(checkoutDate)
        date.setDate(date.getDate() + Number(duration) + 1)
        return date.toISOString().split('T')[0]
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
            <div className="card">Devices in use : 10</div>
            <div className="card">Devices in use : 10</div>
            <div className="flex justify-end mx-2 h-full">
                <div onClick={() => {
                    setNewClient({ name: "", number: "", device: "", checkoutDate: "", duration: 1, guaranteed: false, Amount: 0, status: "still" })
                    setEditIndex(null)
                    setIsOpen(true)
                }} className="flex items-center  gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-indigo-500">
                    <Plus size={16} /><span>Add New</span>
                </div>
            </div>
        </div>

        <ModalClients isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Client">
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
                    <input value={newClient.duration} onChange={(e) => setNewClient({ ...newClient, duration: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="duration" min={"1"} type="number" id="duration" />
                </div>
                <input value={newClient.Amount} onChange={(e) => setNewClient({ ...newClient, Amount: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="Paid Amount" min={"0"} type="number" id="duration" />


                <div className=" flex text-base  px-2  ">
                    <input checked={newClient.guaranteed} onChange={(e) => setNewClient({ ...newClient, guaranteed: e.target.checked })} className="scale-150 cursor-pointer accent-indigo-400" type="checkbox" id="insured" />
                    <label className=" ml-4" htmlFor="insured">did the client pay the insurance ( 2000 DA)</label>
                </div>
                <button
                    onClick={() => { saveClient(); setIsOpen(false) }}
                    className="bg-indigo-400 text-white rounded-lg py-2 hover:bg-indigo-500">
                    {editIndex === null ? "Save" : "Update"}

                </button>

            </div>
        </ModalClients>

        <div style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }} className="grid mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
            <div className="col-span-2 flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Name</p><ChevronDown size={16} />
            </div>
            <div className="col-span-2 flex items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Number</p>
            </div>
            <div className="col-span-3 flex  items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Device</p>
            </div>
            <div className="col-span-2 flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Checkout</p><ChevronDown size={16} />
            </div>
            <div className="col-span-1 flex justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Duration</p>
            </div>
            <div className="col-span-2 flex items-center justify-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Due</p><ChevronDown size={16} />
            </div>
            <div className="col-span-2 flex justify-center items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Guaranteed</p><ChevronDown size={16} />
            </div>

            <div className="col-span-1 flex  justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>Amount</p><ChevronDown size={16} />
            </div>
            <div className="col-span-1 flex  items-center justify-center cursor-pointer  text-sm font-semibold text-gray-600">
                <ChevronDown className="" size={16} />
            </div>
            <div className="col-span-1" />
        </div>

        <div className="flex flex-col mx-2 mt-1">
            {data.map((item, index) => (
                <div key={index} className="grid grid-cols-17 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-800 col-span-2 px-1">{item.name}</p>
                    <p className="text-sm text-gray-800 col-span-2">{item.number}</p>
                    <p className="text-sm text-gray-800 col-span-3">{item.device}</p>
                    <p className="text-sm text-gray-800 col-span-2">{item.checkoutDate}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.duration}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center">    {calculateDueDate(item.checkoutDate, item.duration)}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center ">{item.guaranteed.toString()}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.Amount}</p>
                    <div className="col-span-1 flex items-start justify-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full shadow-md ${statusStyles[item.status]}`}>
                            {item.status}
                        </span>
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                        <Pencil onClick={() => {
                            setNewClient(item)
                            setEditIndex(index)
                            setIsOpen(true)
                        }} className="text-indigo-500 w-4  cursor-pointer hover:text-indigo-800" />
                        <X onClick={() => deleteClient(index)} className="text-red-400  cursor-pointer hover:text-red-700" />
                    </div>
                </div>
            ))}
        </div>


    </>);
}
