import { Plus, ChevronDown, ChevronUp, X, Pencil, IndentIcon, ChevronsUpDown, Eye, Check, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ModalClients from "./ModalClients";
import { useLang } from './context/LanguageContext'
import { t } from './lang/translations'


export function DisplayClients() {
    const [isOpen, setIsOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [data, setData] = useState([])
    const [devices, setDevices] = useState([])
    const [sortKey, setSortKey] = useState(null)
    const [sortDir, setSortDir] = useState(0)
    const [durationMode, setDurationMode] = useState("radio")
    const [paymentMode, setPaymentMode] = useState("immediate")
    const [originalData, setOriginalData] = useState([]);
    const [extendPaymentMode, setExtendPaymentMode] = useState("immediate")
    const { lang } = useLang()


    const [newClient, setNewClient] = useState({
        name: "", number: "", device: "", address: "", checkoutDate: "",
        duration: null, guaranteed: false, Amount: "", Bill: "", status: "still", extendedDuration: null, observation: null,
    })

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-clients').then((d) => {
            setData(d);
            setOriginalData(d);
        })
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
    }, [])
    useEffect(() => {
        function handleF10(e) {
            if (e.key === 'F10' && isOpen) {
                e.preventDefault()
                if (isFormValid()) {
                    saveClient()
                }
            }
        }
        window.addEventListener('keydown', handleF10)
        return () => window.removeEventListener('keydown', handleF10)
    }, [isOpen, newClient])
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                document.getElementById('name')?.focus()
            }, 150)
        }
    }, [isOpen])

    useEffect(() => {
        function handleGlobalEnter(e) {
            if (e.key === 'Enter' && !isOpen) {
                setNewClient({ name: "", number: "", device: "", address: "", checkoutDate: "", duration: null, guaranteed: false, Amount: "", Bill: "", status: "still", extendedDuration: null, observation: null })
                setEditIndex(null)
                setPaymentMode("immediate")
                setIsOpen(true)
            }
        }
        window.addEventListener('keydown', handleGlobalEnter)
        return () => window.removeEventListener('keydown', handleGlobalEnter)
    }, [isOpen])

    function handleEnter(e, nextId) {
        if (e.key === 'Enter') {
            document.getElementById(nextId)?.focus()
        }
    }


    function isFormValid() {
        return newClient.name !== "" &&
            newClient.number !== "" &&
            newClient.device !== "" &&
            newClient.checkoutDate !== "" &&
            newClient.duration !== null &&
            (newClient.Amount !== "" || newClient.Bill !== "")
    }

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
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
        window.electron.ipcRenderer.invoke('get-clients').then((d) => {
            setData(d)
            setOriginalData(d)
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

    async function extendClient() {
        const extended = {
            ...newClient,
            duration: Number(newClient.duration) + Number(newClient.extendedDuration),
            status: "still",
            Bill: Number(newClient.Bill || 0) + Number(newClient.billExtended || 0),
            Amount: Number(newClient.Amount || 0) + Number(newClient.amountExtended || 0),
            extendedDuration: null,
            billExtended: 0,
            amountExtended: 0
        }
        await window.electron.ipcRenderer.invoke('update-client', editIndex, extended)
        window.electron.ipcRenderer.invoke('get-clients').then((d) => {
            setData(d)
            setOriginalData(d)
        })
        setIsOpen(false)
    }

    function calculateDueDate(checkoutDate, duration) {
        if (!checkoutDate) return "N/A"
        const date = new Date(checkoutDate)
        if (isNaN(date.getTime())) return "N/A"
        date.setDate(date.getDate() + Number(duration) + 1)
        return date.toISOString().split('T')[0]
    }

    function calculateDevices() {
        return data.filter(c => {
            const status = c.status === "done" ? "done" : getStatus(calculateDueDate(c.checkoutDate, c.duration))
            return status !== "done"
        }).length
    }
    function calculateAvailable() {
        return devices.filter(d => d.status === "available").length
    }

    const STATUS = {
        STILL: "still",
        DUE: "due",
        DONE: "done"
    }

    const statusLabels = {
        still: t[lang].still,
        due: t[lang].due_status,
        done: t[lang].done,
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
            <div className="card ">{t[lang].devicesInUse} {calculateDevices()}</div>
            <div className="card">{t[lang].devicesAvailable} {calculateAvailable()}</div>
            <div className="flex justify-end mx-2 h-full">
                <div onClick={() => {
                    setNewClient({ name: "", number: "", device: "", address: "", checkoutDate: "", duration: null, guaranteed: false, Amount: "", Bill: "", status: "still", extendedDuration: null, observation: null })
                    setEditIndex(null)
                    setPaymentMode("immediate")
                    setIsOpen(true)
                }} className="flex items-center  gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-indigo-500">
                    <Plus size={16} /><span>{t[lang].addNew}</span>
                </div>
            </div>
        </div>

        <ModalClients isOpen={isOpen} onClose={() => setIsOpen(false)} title={editIndex === null ? t[lang].addNewClient : t[lang].updateClient}>
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
                <div className="flex flex-col gap-8">
                    <input onKeyDown={(e) => handleEnter(e, 'number')}
                        autoFocus id="name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder={t[lang].name} />
                    <input onKeyDown={(e) => handleEnter(e, 'address')} id="number" value={newClient.number} onChange={(e) => setNewClient({ ...newClient, number: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder={t[lang].number} />
                    <input onKeyDown={(e) => handleEnter(e, 'device-select')}
                        id="address" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder={t[lang].address} />

                    <select onKeyDown={(e) => handleEnter(e, 'checkout')} id="device-select" value={newClient.device} onChange={(e) => setNewClient({ ...newClient, device: e.target.value })} className="border appearance-none border-gray-200 rounded-lg p-2 text-sm text-gray-600">
                        <option value="">{t[lang].selectDevice}</option>
                        {devices.filter(d => d.status === "available").map((device, index) => (
                            <option key={index} value={device.id}>{device.id}</option>
                        ))}
                    </select>
                    <input lang="en-GB" onKeyDown={(e) => handleEnter(e, 'duration')} id="checkout" value={newClient.checkoutDate} onChange={(e) => setNewClient({ ...newClient, checkoutDate: e.target.value })} className="border border-gray-200 rounded-lg p-2 text-sm " placeholder={t[lang].checkoutDate} type="date" />
                </div>
                <div className="w-px bg-gray-200 mx-2 self-stretch" />
                <div className="flex flex-col gap-4 ">
                    <div className="flex justify-between items-center">
                        <label>{t[lang].duration}</label>
                        <button
                            onClick={() => setDurationMode(durationMode === "radio" ? "number" : "radio")}
                            className="px-2 py-1 rounded-md text-xs text-indigo-500 hover:text-indigo-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                            {durationMode === "radio" ? `${t[lang].durationEnter}` : `${t[lang].presets}`}
                        </button>
                    </div>
                    {durationMode === "radio" ? (
                        <div className="flex flex-col flex-1 justify-center">
                            <label className="flex flex-row gap-10 justify-center items-center cursor-pointer">
                                <span>10 {t[lang].durationDays}</span>
                                <input id="duration" className="accent-indigo-400" type="radio" onKeyDown={(e) => handleEnter(e, 'amount')} name="duration" checked={newClient.duration === 10} onChange={(e) => setNewClient({
                                    ...newClient, duration: 10,
                                    Amount: paymentMode === "immediate" ? 500 : "",
                                    Bill: paymentMode === "bill" ? 500 : ""
                                })} />
                            </label>
                            <label className="flex flex-row gap-10 justify-center items-center cursor-pointer">
                                <span>20 {t[lang].durationDays}</span>

                                <input className="accent-indigo-400" type="radio" name="duration" onKeyDown={(e) => handleEnter(e, 'amount')} checked={newClient.duration === 20} onChange={(e) => setNewClient({
                                    ...newClient, duration: 20,
                                    Amount: paymentMode === "immediate" ? 750 : "",
                                    Bill: paymentMode === "bill" ? 750 : ""
                                })} />
                            </label>
                            <label className="flex flex-row gap-10 justify-center items-center cursor-pointer">
                                <span>30 {t[lang].durationDays}</span>

                                <input className="accent-indigo-400" type="radio" name="duration" onKeyDown={(e) => handleEnter(e, 'amount')} checked={newClient.duration === 30} onChange={(e) => setNewClient({
                                    ...newClient, duration: 30,
                                    Amount: paymentMode === "immediate" ? 1000 : "",
                                    Bill: paymentMode === "bill" ? 1000 : ""
                                })} />
                            </label>
                        </div>
                    ) : (
                        <input
                            type="number"
                            min="1"
                            onKeyDown={(e) => handleEnter(e, 'amount')}
                            value={newClient.duration || ""}
                            onChange={(e) => setNewClient({ ...newClient, duration: Number(e.target.value) })}
                            className="border border-gray-200 rounded-lg p-2 text-sm"
                            placeholder="Number of days"
                        />
                    )}
                    <hr className="border-t border-gray-400 " />

                    <div className="flex flex-col gap-2">
                        <div className="flex rounded-lg overflow-hidden border border-gray-200">
                            <button
                                onClick={() => {
                                    setPaymentMode("immediate")
                                    if (newClient.duration) setNewClient({ ...newClient, Amount: newClient.duration === 10 ? 500 : newClient.duration === 20 ? 750 : 1000, Bill: "" })

                                }}
                                disabled={editIndex !== null}

                                className={`flex-1 py-2 text-sm transition-colors ${paymentMode === "immediate" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                {t[lang].PayNow}
                            </button>
                            <button
                                onClick={() => {
                                    setPaymentMode("bill")
                                    if (newClient.duration) setNewClient({ ...newClient, Bill: newClient.duration === 10 ? 500 : newClient.duration === 20 ? 750 : 1000, Amount: "" })

                                }}
                                disabled={editIndex !== null}

                                className={`flex-1 py-2 text-sm transition-colors ${paymentMode === "bill" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                {t[lang].PayLater}
                            </button>
                        </div>

                        {paymentMode === "immediate" ? (
                            <input
                                id="amount"
                                value={newClient.Amount}
                                onKeyDown={(e) => handleEnter(e, 'observation')}
                                onChange={(e) => setNewClient({ ...newClient, Amount: e.target.value, Bill: "" })}
                                className="border border-gray-200 rounded-lg p-2 text-sm"
                                placeholder={t[lang].paidAmount}
                                type="number"
                            />
                        ) : (
                            <input
                                id="amount"
                                value={newClient.Bill}
                                onKeyDown={(e) => handleEnter(e, 'observation')}
                                onChange={(e) => setNewClient({ ...newClient, Bill: e.target.value, Amount: "" })}
                                className="border border-gray-200 rounded-lg p-2 text-sm"
                                placeholder={t[lang].bill}
                                type="number"
                            />
                        )}
                    </div>

                    <hr className="border-t border-gray-400 " />

                    <input
                        id="observation"
                        value={newClient.observation || ""}
                        onKeyDown={(e) => handleEnter(e, 'insured')}
                        onChange={(e) => setNewClient({ ...newClient, observation: e.target.value || null })}
                        className="border border-gray-200 rounded-lg p-2 text-sm"
                        placeholder={`${t[lang].observationText}`}
                    />
                    <div className=" flex text-base gap-2 px-2  ">
                        <input
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    setNewClient({ ...newClient, guaranteed: !newClient.guaranteed })
                                }
                            }}
                            checked={newClient.guaranteed}
                            onChange={(e) => setNewClient({ ...newClient, guaranteed: e.target.checked })}
                            className="scale-150 cursor-pointer accent-indigo-400"
                            type="checkbox"
                            id="insured"
                        />                        <label className=" ml-4" htmlFor="insured">{t[lang].insuranceLabel} </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-5 mt-5">
                {editIndex === null ?
                    <>
                        <button
                            onClick={() => { saveClient(); setIsOpen(false) }}
                            disabled={!isFormValid()}
                            className="bg-indigo-400 flex-1 text-white rounded-lg py-2 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {t[lang].save}
                        </button>
                    </> :
                    newClient.status === "due" ?
                        <>
                            <button
                                onClick={() => { saveClient("done"); setIsOpen(false) }}
                                disabled={!isFormValid()}
                                className="bg-green-400 flex-1 text-white rounded-lg py-2 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {t[lang].deviceReturned}
                            </button>
                            <button
                                onClick={() => { saveClient(); setIsOpen(false) }}
                                disabled={!isFormValid()}
                                className="bg-indigo-400 flex-1 text-white rounded-lg py-2 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {t[lang].update}
                            </button>

                        </> :
                        newClient.status === "done" ?
                            <>
                                <button
                                    onClick={() => { saveClient("still"); setIsOpen(false) }}
                                    disabled={!isFormValid()}
                                    className="bg-red-400 flex-1 text-white rounded-lg py-2 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {t[lang].uncheck}
                                </button>
                                <button
                                    onClick={() => { saveClient(); setIsOpen(false) }}
                                    disabled={!isFormValid()}
                                    className="bg-indigo-400 flex-1 text-white rounded-lg py-2 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {t[lang].update}
                                </button>
                            </> :
                            <>
                                <button
                                    onClick={() => { saveClient("done"); setIsOpen(false) }}
                                    disabled={!isFormValid()}
                                    className="bg-green-400 flex-1 text-white rounded-lg py-2 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {t[lang].deviceReturned}
                                </button>
                                <button
                                    onClick={() => { saveClient(); setIsOpen(false) }}
                                    disabled={!isFormValid()}
                                    className="bg-indigo-400 flex-1 text-white rounded-lg py-2 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {t[lang].update}
                                </button>

                            </>
                }
            </div>
            <div className="flex flex-col gap-5 mt-5">
                {editIndex !== null ?
                    newClient.status === "due" ?
                        <>
                            <button
                                onClick={() => { extendClient() }}
                                disabled={newClient.extendedDuration === null}
                                className="bg-orange-400 flex-1 text-white rounded-lg py-2 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {t[lang].extendPeriod}
                            </button>

                            <div className="flex rounded-lg overflow-hidden border border-gray-200">
                                <button
                                    onClick={() => setExtendPaymentMode("immediate")}
                                    className={`flex-1 py-2 text-sm transition-colors ${extendPaymentMode === "immediate" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                    {t[lang].PayNow}
                                </button>
                                <button
                                    onClick={() => setExtendPaymentMode("bill")}
                                    className={`flex-1 py-2 text-sm transition-colors ${extendPaymentMode === "bill" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                    {t[lang].PayLater}
                                </button>
                            </div>

                            <div className="flex justify-center items-center">
                                <label>{t[lang].extendingDuration}</label>
                                <div className="flex flex-row flex-1 gap-14 justify-center ">

                                    <label className="flex flex-row gap-2 justify-center items-center cursor-pointer">
                                        <input className="accent-indigo-400" type="radio" name="extendedDuration" id="" checked={newClient.extendedDuration === 10}
                                            onChange={(e) => {
                                                setNewClient({
                                                    ...newClient,
                                                    extendedDuration: 10,
                                                    billExtended: extendPaymentMode === "bill" ? 250 : 0,
                                                    amountExtended: extendPaymentMode === "immediate" ? 250 : 0
                                                });
                                            }} />
                                        <span>10 {t[lang].durationDays}</span>
                                    </label>

                                    <label className="flex flex-row gap-2 justify-center items-center cursor-pointer">
                                        <input className="accent-indigo-400" type="radio" name="extendedDuration" id="" checked={newClient.extendedDuration === 20}
                                            onChange={(e) => {
                                                setNewClient({
                                                    ...newClient,
                                                    extendedDuration: 20,
                                                    billExtended: extendPaymentMode === "bill" ? 500 : 0,
                                                    amountExtended: extendPaymentMode === "immediate" ? 500 : 0
                                                });
                                            }} />
                                        <span>20 {t[lang].durationDays}</span>
                                    </label>

                                    <label className="flex flex-row gap-2 justify-center items-center cursor-pointer">
                                        <input className="accent-indigo-400" type="radio" name="extendedDuration" id="" checked={newClient.extendedDuration === 30}
                                            onChange={(e) => {
                                                setNewClient({
                                                    ...newClient,
                                                    extendedDuration: 30,
                                                    billExtended: extendPaymentMode === "bill" ? 750 : 0,
                                                    amountExtended: extendPaymentMode === "immediate" ? 750 : 0
                                                });
                                            }} />
                                        <span>30 {t[lang].durationDays}</span>
                                    </label>
                                </div>
                            </div>
                        </>
                        : ""
                    : ""
                }
            </div>


        </ModalClients>

        <div style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }} className="grid mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
            <div onClick={() => channgedisplay("name")} className="col-span-2 flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].name}</p> {sortKey === "name"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-2 flex items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].number}</p>
            </div>
            <div className="col-span-1 flex  items-center  gap-1 text-sm font-semibold text-gray-600  justify-center">
                <p>{t[lang].device}</p>
            </div>
            <div onClick={() => channgedisplay("checkoutdate")} className="col-span-2 flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600 justify-center">
                <p>{t[lang].checkout}</p>{sortKey === "checkoutdate"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-1 flex justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].duration}</p>
            </div>
            <div onClick={() => channgedisplay("duedate")} className="col-span-2 flex items-center justify-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].due}</p>{sortKey === "duedate"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-2 flex justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].guaranteed}</p>
            </div>

            <div className="col-span-1 flex  justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].amount}</p>
            </div>
            <div className="col-span-1 flex  justify-center items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].bill}</p>
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
                    <p className="text-sm text-gray-800 col-span-1 flex items-start  justify-center">{item.device}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center">{item.checkoutDate}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.duration}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center">    {calculateDueDate(item.checkoutDate, item.duration)}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center ">{item.guaranteed ? <Check className="text-green-400" /> : <X className="text-indigo-400" />}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.Amount}</p>
                    <div className="col-span-1 flex items-start justify-center">
                        {item.Bill === "" ? "" : <>
                            <span className={"col-span-1 text-xs px-2 py-0.5 rounded-full shadow-md bg-blue-100 text-blue-400 shadow-blue-300"}>
                                {item.Bill}
                            </span>
                        </>}
                    </div>
                    <div className="col-span-1 flex items-start justify-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full shadow-md ${statusStyles[currentstatus]}`}>
                            {statusLabels[currentstatus]}
                        </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                        {item.observation && (
                            <div className="relative group">
                                <Eye className="text-slate-400 hover:text-slate-600 hover:cursor-pointer" />
                                <div className={`absolute bottom-full mb-2 w-48 bg-slate-100 border border-gray-600 rounded-xl p-3 shadow-lg z-10
                                opacity-0 scale-95 pointer-events-none
                                group-hover:opacity-100 group-hover:scale-100
                                transition-all duration-200 ${lang === 'ar' ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'}`}>
                                    <p className="text-xs font-semibold text-gray-400 mb-1">{t[lang].observation}</p>
                                    <p className="text-sm text-gray-800 break-words">{item.observation}</p>
                                </div>
                            </div>
                        )}
                        <Pencil onClick={() => {
                            const Index = data.findIndex(d => d.name === item.name && d.number === item.number)
                            const currentstatus = item.status === "done" ? "done" : getStatus(calculateDueDate(item.checkoutDate, item.duration))
                            setNewClient({ ...item, status: currentstatus })
                            setPaymentMode(item.Bill !== "" ? "bill" : "immediate")
                            setEditIndex(Index)
                            setIsOpen(true)
                        }} className="text-indigo-500 w-4 cursor-pointer hover:text-indigo-800" />

                        <Trash2 onClick={() => {
                            const Index = data.findIndex(d => d.name === item.name && d.number === item.number)

                            deleteClient(Index);
                        }} className="text-red-400  cursor-pointer hover:text-red-700 w-[20px]" />
                    </div>
                </div>
                )
            })}
        </div>


    </>);
}
