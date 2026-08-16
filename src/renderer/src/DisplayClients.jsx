import { Plus, ChevronDown, ChevronUp, X, Phone, Pencil, IndentIcon, SendHorizontal, ChevronsUpDown, Eye, Check, Trash2, Minus } from "lucide-react";
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
    const [extendDurationMode, setExtendDurationMode] = useState("radio")
    const [paymentMode, setPaymentMode] = useState("immediate")
    const [originalData, setOriginalData] = useState([]);
    const [extendPaymentMode, setExtendPaymentMode] = useState("immediate")
    const { lang } = useLang()

    const emptyClient = {
        name: "", number: "", device: "", address: "", checkoutDate: "",
        duration: null, guaranteed: "", Amount: "", Bill: "", status: "still",
        extendedDuration: null, observation: null, called: false,
    }

    const [newClient, setNewClient] = useState(emptyClient)

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
                setNewClient(emptyClient)
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

    function findClientIndex(item) {
        if (item.id !== undefined && item.id !== null) {
            const idIndex = data.findIndex(d => d.id === item.id)
            if (idIndex !== -1) return idIndex
        }
        return data.findIndex(d => d.name === item.name && d.number === item.number)
    }

    function isFormValid() {
        return newClient.name !== "" &&
            newClient.number !== "" &&
            newClient.device !== "" &&
            newClient.checkoutDate !== "" &&
            newClient.duration !== null &&
            newClient.duration > 0 &&
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
        let clientToSave = statusOverride ? { ...newClient, status: statusOverride } : newClient;
        const previousDevice = editIndex !== null ? data[editIndex]?.device : null;

        if (editIndex === null) {
            clientToSave = { ...clientToSave, id: clientToSave.id ?? Date.now() }
            await window.electron.ipcRenderer.invoke('add-client', clientToSave)
            await window.electron.ipcRenderer.invoke('update-device-status', clientToSave.device, 'in-use')
        } else {
            await window.electron.ipcRenderer.invoke('update-client', editIndex, clientToSave)

            if (previousDevice && previousDevice !== clientToSave.device) {
                await window.electron.ipcRenderer.invoke('update-device-status', previousDevice, 'available')
            }

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

    async function payOffBill() {
        const settled = {
            ...newClient,
            Amount: Number(newClient.Amount || 0) + Number(newClient.Bill || 0),
            Bill: 0,
        }
        await window.electron.ipcRenderer.invoke('update-client', editIndex, settled)
        setNewClient(settled)
        window.electron.ipcRenderer.invoke('get-clients').then((d) => {
            setData(d)
            setOriginalData(d)
        })
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
            case "status": {
                const statusA = a.status === "done" ? "done" : getStatus(calculateDueDate(a.checkoutDate, a.duration))
                const statusB = b.status === "done" ? "done" : getStatus(calculateDueDate(b.checkoutDate, b.duration))
                return statusA.localeCompare(statusB) * sortDir
            }
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
        date.setDate(date.getDate() + Number(duration))
        return date.toISOString().split('T')[0]
    }

    function getLateInfo(dueDate) {
        if (dueDate === "N/A") return { days: 0, bill: 0 }
        const due = new Date(dueDate)
        due.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const daysLate = Math.floor((today - due) / (1000 * 60 * 60 * 24))
        return daysLate > 0 ? { days: daysLate, bill: daysLate * 70 } : { days: 0, bill: 0 }
    }

    function calculateDevices() {
        return data.filter(c => {
            const status = c.status === "done" ? "done" : getStatus(calculateDueDate(c.checkoutDate, c.duration))
            return status !== "done"
        }).length
    }

    function calculateAmount(duration) {
        const rate = duration >= 30 ? 50 : 70
        return duration * rate
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
                    setNewClient(emptyClient)
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
                <div className="flex flex-col justify-between">
                    <p className="text-lg font-semibold mb-3">Patient Informations</p>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-600">{t[lang].name}</label>
                        <input dir="ltr" onKeyDown={(e) => handleEnter(e, 'number')}
                            autoFocus id="name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="border border-gray-200 rounded-lg p-3 text-sm" placeholder={t[lang].name} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-600">{t[lang].number}</label>
                        <input dir="ltr" onKeyDown={(e) => handleEnter(e, 'address')} id="number" value={newClient.number} onChange={(e) => setNewClient({ ...newClient, number: e.target.value })} className="border border-gray-200 rounded-lg p-3 text-sm" placeholder={t[lang].number} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-600">{t[lang].address}</label>
                        <input dir="ltr" onKeyDown={(e) => handleEnter(e, 'device-select')}
                            id="address" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} className="border border-gray-200 rounded-lg p-3 text-sm" placeholder={t[lang].address} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-600">{t[lang].selectDevice}</label>
                        <select onKeyDown={(e) => handleEnter(e, 'checkout')} id="device-select" value={newClient.device} onChange={(e) => setNewClient({ ...newClient, device: e.target.value })} className="border appearance-none border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                            <option value="">{t[lang].selectDevice}</option>
                            {devices
                                .filter(d => d.status === "available" || d.id === newClient.device)
                                .map((device, index) => (
                                    <option key={index} value={device.id}>{device.id}</option>
                                ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-600">{t[lang].checkoutDate}</label>
                        <input lang="en-GB" onKeyDown={(e) => handleEnter(e, 'duration')} id="checkout" value={newClient.checkoutDate} onChange={(e) => setNewClient({ ...newClient, checkoutDate: e.target.value })} className="border border-gray-200 rounded-lg p-3 text-sm " placeholder={t[lang].checkoutDate} type="date" />
                    </div>

                </div>

                <div className="w-px bg-gray-200 mx-2 self-stretch" />
                <div className="flex flex-col gap-4 ">
                    <div className="flex flex-col gap-4">
                        <p className="text-lg font-semibold">Payement Informations</p>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-600">{t[lang].duration}</label>
                                <button
                                    onClick={() => setDurationMode(durationMode === "radio" ? "number" : "radio")}
                                    className="px-2 py-1 rounded-md text-xs text-indigo-500 hover:text-indigo-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                                    {durationMode === "radio" ? `${t[lang].durationEnter}` : `${t[lang].presets}`}
                                </button>
                            </div>
                            {durationMode === "radio" ? (
                                <div className="flex flex-row flex-1 text-s justify-between ">
                                    <label className="flex flex-row gap-2 justify-center items-center cursor-pointer">
                                        <input id="duration" className="accent-indigo-400" type="radio" onKeyDown={(e) => handleEnter(e, 'amount')} name="duration" checked={newClient.duration === 10} onChange={(e) => setNewClient({
                                            ...newClient, duration: 10,
                                            Amount: paymentMode === "immediate" ? calculateAmount(10) : "",
                                            Bill: paymentMode === "bill" ? calculateAmount(10) : ""
                                        })} />
                                        <span>10 {t[lang].durationDays}</span>

                                    </label>
                                    <label className="flex flex-row gap-2 justify-center items-center cursor-pointer">
                                        <input className="accent-indigo-400" type="radio" name="duration" onKeyDown={(e) => handleEnter(e, 'amount')} checked={newClient.duration === 20} onChange={(e) => setNewClient({
                                            ...newClient, duration: 20,
                                            Amount: paymentMode === "immediate" ? calculateAmount(20) : "",
                                            Bill: paymentMode === "bill" ? calculateAmount(20) : ""
                                        })} />
                                        <span>20 {t[lang].durationDays}</span>

                                    </label>
                                    <label className="flex flex-row gap-2 justify-center items-center cursor-pointer">
                                        <input className="accent-indigo-400" type="radio" name="duration" onKeyDown={(e) => handleEnter(e, 'amount')} checked={newClient.duration === 30} onChange={(e) => setNewClient({
                                            ...newClient, duration: 30,
                                            Amount: paymentMode === "immediate" ? calculateAmount(30) : "",
                                            Bill: paymentMode === "bill" ? calculateAmount(30) : ""
                                        })} />
                                        <span>30 {t[lang].durationDays}</span>

                                    </label>
                                </div>
                            ) : (
                                <input
                                    type="number"
                                    min="1"
                                    value={newClient.duration || ""}
                                    onChange={(e) => {
                                        const raw = e.target.value
                                        const days = raw === "" ? null : Math.max(1, Number(raw))
                                        setNewClient({
                                            ...newClient,
                                            duration: days,
                                            Amount: paymentMode === "immediate" && days ? calculateAmount(days) : "",
                                            Bill: paymentMode === "bill" && days ? calculateAmount(days) : ""
                                        })
                                    }}
                                    className="border border-gray-200 rounded-lg p-2 text-sm"
                                    placeholder="Number of days"
                                />
                            )}
                        </div>


                        <div className="flex rounded-lg overflow-hidden border border-gray-200">
                            <button
                                onClick={() => {
                                    setPaymentMode("immediate")
                                    if (newClient.duration) setNewClient({ ...newClient, Amount: calculateAmount(newClient.duration), Bill: "" })
                                }}
                                disabled={editIndex !== null}
                                className={`flex-1 py-2 text-sm transition-colors ${paymentMode === "immediate" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                {t[lang].PayNow}
                            </button>
                            <button
                                onClick={() => {
                                    setPaymentMode("bill")
                                    if (newClient.duration) setNewClient({ ...newClient, Bill: calculateAmount(newClient.duration), Amount: "" })
                                }}
                                disabled={editIndex !== null}
                                className={`flex-1 py-2 text-sm transition-colors ${paymentMode === "bill" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                {t[lang].PayLater}
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-600">{t[lang].payement}</label>

                            {paymentMode === "immediate" ? (
                                <input
                                    id="amount"
                                    value={newClient.Amount}
                                    onKeyDown={(e) => handleEnter(e, 'observation')}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                                        setNewClient({ ...newClient, Amount: val, Bill: "" })
                                    }}
                                    className="border border-gray-200 rounded-lg p-2 text-sm"
                                    placeholder={t[lang].paidAmount}
                                    type="number"
                                    min="0"
                                />
                            ) : (
                                <input
                                    id="amount"
                                    value={newClient.Bill}
                                    onKeyDown={(e) => handleEnter(e, 'observation')}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                                        setNewClient({ ...newClient, Bill: val, Amount: "" })
                                    }}
                                    className="border border-gray-200 rounded-lg p-2 text-sm"
                                    placeholder={t[lang].bill}
                                    type="number"
                                    min="0"
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-600">{t[lang].observation}</label>
                        <input
                            id="observation"
                            value={newClient.observation || ""}
                            onKeyDown={(e) => handleEnter(e, 'insured')}
                            onChange={(e) => setNewClient({ ...newClient, observation: e.target.value || null })}
                            className="border border-gray-200 rounded-lg p-2 text-sm"
                            placeholder={`${t[lang].observationText}`}
                        />
                    </div>


                    <div className=" flex items-center justify-between">
                        <label className="  text-sm text-slate-600" htmlFor="insured">{t[lang].insuranceLabel} :</label>
                        <input
                            value={newClient.guaranteed || ""}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (isFormValid()) saveClient()
                                }
                            }}
                            onChange={(e) => {
                                const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                                setNewClient({ ...newClient, guaranteed: val })
                            }}
                            className="border w-[60%] border-gray-200 rounded-lg  p-2 text-sm"
                            placeholder="0"
                            type="number"
                            min="0"
                            id="insured"
                        />
                    </div>

                    <div className="flex text-base gap-2 px-2 items-center">
                        <input
                            checked={newClient.called}

                            onChange={(e) => setNewClient({ ...newClient, called: e.target.checked })}
                            className="scale-150 cursor-pointer accent-indigo-400" type="checkbox" id="called" />
                        <label className="ml-4 flex flex-row items-center gap-2" htmlFor="called"><Phone size={20} strokeWidth={2.5} className="text-indigo-500" />{t[lang].Calling}</label>
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
                {editIndex !== null && Number(newClient.Bill || 0) > 0 && (
                    <button
                        onClick={payOffBill}
                        className="bg-blue-400 flex-1 text-white rounded-lg py-2 hover:bg-blue-500">
                        {t[lang].billPaid} ({newClient.Bill} DA)
                    </button>
                )}
                {editIndex !== null ?
                    newClient.status === "due" ?
                        <>
                            <div className="bg-slate-100 p-4 border border-slate-300 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-slate-600 font-semibold">{t[lang].extendingDuration}</label>
                                    <button
                                        onClick={() => setExtendDurationMode(extendDurationMode === "radio" ? "number" : "radio")}
                                        className="px-2 py-1 rounded-md text-xs text-indigo-500 hover:text-indigo-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                                        {extendDurationMode === "radio" ? `${t[lang].durationEnter}` : `${t[lang].presets}`}
                                    </button>
                                </div>

                                {extendDurationMode === "radio" ? (
                                    <div className="flex flex-row flex-1 gap-14 justify-between ">
                                        <label className="flex flex-row py-2 w-[28%] px-4 justify-start bg-white rounded-md border border-slate-200 gap-2  items-center cursor-pointer">
                                            <input className=" accent-indigo-400" type="radio" name="extendedDuration" checked={newClient.extendedDuration === 10}
                                                onChange={(e) => {
                                                    setNewClient({
                                                        ...newClient,
                                                        extendedDuration: 10,
                                                        billExtended: extendPaymentMode === "bill" ? 10 * 70 : 0,
                                                        amountExtended: extendPaymentMode === "immediate" ? 10 * 70 : 0
                                                    });
                                                }} />
                                            <span>10 {t[lang].durationDays}</span>
                                        </label>

                                        <label className="flex flex-row py-2 w-[28%] px-4 justify-start bg-white rounded-md border border-slate-200 gap-2  items-center cursor-pointer">
                                            <input className="accent-indigo-400" type="radio" name="extendedDuration" checked={newClient.extendedDuration === 20}
                                                onChange={(e) => {
                                                    setNewClient({
                                                        ...newClient,
                                                        extendedDuration: 20,
                                                        billExtended: extendPaymentMode === "bill" ? 20 * 70 : 0,
                                                        amountExtended: extendPaymentMode === "immediate" ? 20 * 70 : 0
                                                    });
                                                }} />
                                            <span>20 {t[lang].durationDays}</span>
                                        </label>

                                        <label className="flex flex-row py-2 w-[28%] px-4 justify-start bg-white rounded-md border border-slate-200 gap-2  items-center cursor-pointer">
                                            <input className="accent-indigo-400" type="radio" name="extendedDuration" checked={newClient.extendedDuration === 30}
                                                onChange={(e) => {
                                                    setNewClient({
                                                        ...newClient,
                                                        extendedDuration: 30,
                                                        billExtended: extendPaymentMode === "bill" ? 30 * 70 : 0,
                                                        amountExtended: extendPaymentMode === "immediate" ? 30 * 70 : 0
                                                    });
                                                }} />
                                            <span>30 {t[lang].durationDays}</span>
                                        </label>
                                    </div>
                                ) : (
                                    <input
                                        type="number"
                                        min="1"
                                        value={newClient.extendedDuration || ""}
                                        onChange={(e) => {
                                            const raw = e.target.value
                                            const days = raw === "" ? null : Math.max(1, Number(raw))
                                            setNewClient({
                                                ...newClient,
                                                extendedDuration: days,
                                                billExtended: extendPaymentMode === "bill" && days ? days * 70 : 0,
                                                amountExtended: extendPaymentMode === "immediate" && days ? days * 70 : 0
                                            })
                                        }}
                                        className="w-[47%] border  border-gray-200 rounded-lg p-2 text-sm "
                                        placeholder={t[lang].durationDays}
                                    />
                                )}
                                <div className="h-[1px] w-full bg-slate-300 my-4"></div>
                                <div className="flex  flex-row flex-1 justify-between">
                                    <button
                                        onClick={() => { extendClient() }}
                                        disabled={!newClient.extendedDuration || newClient.extendedDuration <= 0}
                                        className="flex bg-indigo-400 px-6 gap-2 items-center text-white rounded-s py-2 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <SendHorizontal size={16} />{t[lang].extendPeriod}
                                    </button>
                                    <div className="flex w-[50%] rounded-s overflow-hidden border border-gray-200">
                                        <button
                                            onClick={() => {
                                                setExtendPaymentMode("immediate")
                                                if (newClient.extendedDuration) {
                                                    setNewClient({
                                                        ...newClient,
                                                        billExtended: 0,
                                                        amountExtended: newClient.extendedDuration * 70
                                                    })
                                                }
                                            }}
                                            className={` flex-1 py-2 text-sm transition-colors ${extendPaymentMode === "immediate" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                            {t[lang].PayNow}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setExtendPaymentMode("bill")
                                                if (newClient.extendedDuration) {
                                                    setNewClient({
                                                        ...newClient,
                                                        billExtended: newClient.extendedDuration * 70,
                                                        amountExtended: 0
                                                    })
                                                }
                                            }}
                                            className={`flex-1 py-2 text-sm transition-colors ${extendPaymentMode === "bill" ? "bg-indigo-400 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                            {t[lang].PayLater}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                        : ""
                    : ""
                }
            </div>

        </ModalClients>

        <div style={{ gridTemplateColumns: 'repeat(19, minmax(0, 1fr))' }} className="grid mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
            <div onClick={() => channgedisplay("name")} className="col-span-2 flex items-center justify-center cursor-pointer gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].name}</p> {sortKey === "name"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-2 flex items-center justify-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].number}</p>
            </div>
            <div className="col-span-1 flex items-center justify-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].device}</p>
            </div>
            <div onClick={() => channgedisplay("checkoutdate")} className="col-span-2 flex items-center justify-center cursor-pointer gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].checkout}</p>{sortKey === "checkoutdate"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].duration}</p>
            </div>
            <div onClick={() => channgedisplay("duedate")} className="col-span-2 flex items-center justify-center cursor-pointer gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].due}</p>{sortKey === "duedate"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>


            <div className="col-span-2 flex justify-center items-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].guaranteed}</p>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].amount}</p>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].late}</p>
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].bill}</p>
            </div>
            <div onClick={() => channgedisplay("status")} className="col-span-1 flex items-center justify-center cursor-pointer text-xs font-semibold text-gray-600">
                {sortKey === "status"
                    ? sortDir === 1 ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                    : <ChevronsUpDown size={16} />
                }
            </div>
            <div className="col-span-1 flex justify-center items-center gap-1 text-xs font-semibold text-gray-600">
                <p>{t[lang].called}</p>
            </div>
            <div className="col-span-2" />
        </div>

        <div className="flex flex-col mx-2 mt-1">
            {displayData.map((item) => {
                const dueDateStr = calculateDueDate(item.checkoutDate, item.duration)
                const currentstatus = item.status === "done" ? "done" : getStatus(dueDateStr);
                const lateInfo = getLateInfo(dueDateStr)

                return (<div key={item.id ?? (item.name + item.number)} style={{ gridTemplateColumns: 'repeat(19, minmax(0, 1fr))' }} className="grid px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                    <p className="text-xs text-gray-800 col-span-2 flex items-center justify-center text-start break-keep  ">{item.name}</p>
                    <p dir="ltr" className="text-xs text-gray-800 col-span-2 flex items-center justify-center text-center break-keep  ">{item.number}</p>
                    <p className="text-xs text-gray-800 col-span-1 flex items-center justify-center text-center break-keep  ">{item.device}</p>
                    <p className="text-xs text-gray-800 col-span-2 flex items-center justify-center text-center  ">{item.checkoutDate}</p>
                    <p className="text-xs text-gray-800 col-span-1 flex items-center justify-center text-center  ">{item.duration}</p>
                    <p className="text-xs text-gray-800 col-span-2 flex items-center justify-center text-center  ">{dueDateStr}</p>


                    <p className="text-xs text-gray-800 col-span-2 flex items-center justify-center text-center break-keep  ">{item.guaranteed || "-"}</p>
                    <p dir="ltr" className="text-xs text-gray-800 col-span-1 flex items-center justify-center text-center  ">{item.Amount}</p>
                    <div className="col-span-1 flex items-center justify-center  ">
                        {currentstatus === "due" && lateInfo.days > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-full shadow-md bg-red-100 text-red-600 shadow-red-300">
                                {lateInfo.days}d
                            </span>
                        ) : "-"}
                    </div>
                    <div dir="ltr" className="col-span-1 flex items-center justify-center">
                        {(Number(item.Bill || 0) + lateInfo.bill) > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-full shadow-md bg-blue-100 text-blue-400 shadow-blue-300">
                                {Number(item.Bill || 0) + lateInfo.bill}
                            </span>
                        ) : ""}
                    </div>
                    <div className="col-span-1 flex items-center justify-center  ">
                        <span className={`text-xs px-2 py-0.5 rounded-full shadow-md ${statusStyles[currentstatus]}`}>
                            {statusLabels[currentstatus]}
                        </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-center  ">
                        {item.called ? <Check className="text-green-400" size={18} /> : <X className="text-red-400" size={18} />}
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2  ">
                        {item.observation ? (
                            <div className="relative group">
                                <Eye className="text-slate-400 hover:text-slate-600 hover:cursor-pointer" />
                                <div className={`absolute bottom-full mb-2 w-48 bg-slate-100 border border-gray-600 rounded-xl p-3 shadow-lg z-10
                                opacity-0 scale-95 pointer-events-none
                                group-hover:opacity-100 group-hover:scale-100
                                transition-all duration-200 ${lang === 'ar' ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'}`}>
                                    <p className="text-xs font-semibold text-gray-400 mb-1">{t[lang].observation}</p>
                                    <p className="text-xs text-gray-800 break-words">{item.observation}</p>
                                </div>
                            </div>
                        ) : <Minus className="text-slate-500" />}

                        <Pencil onClick={() => {
                            const Index = findClientIndex(item)
                            const currentstatus = item.status === "done" ? "done" : getStatus(calculateDueDate(item.checkoutDate, item.duration))
                            setNewClient({ ...item, status: currentstatus })
                            setPaymentMode(Number(item.Bill || 0) > 0 ? "bill" : "immediate")
                            setEditIndex(Index)
                            setIsOpen(true)
                        }} className="text-indigo-500 min-w-[1.3rem] w-[1.3rem] cursor-pointer hover:text-indigo-800" />

                        <Trash2 onClick={() => {
                            const Index = findClientIndex(item)
                            deleteClient(Index);
                        }} className="text-red-400 min-w-5 w-5 cursor-pointer hover:text-red-700 " />
                    </div>
                </div>
                )
            })}
        </div>

    </>);
}