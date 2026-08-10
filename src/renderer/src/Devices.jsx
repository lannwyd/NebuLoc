import { Plus, ChevronDown, ChevronUp, X, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import ModalDevices from "./ModalDevices"
import { useLang } from './context/LanguageContext'
import { t } from './lang/translations'


export function Devices() {
    const [isOpen, setIsOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [devices, setDevices] = useState([]);
    const [newDeviceId, setNewDeviceId] = useState("")
    const [clients, setClients] = useState([]);
    const { lang } = useLang()
    const [newDeviceNotes, setNewDeviceNotes] = useState("")




    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
        window.electron.ipcRenderer.invoke('get-clients').then(setClients)

    }, [])
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                document.getElementById('device')?.focus()
            }, 150)
        }
    }, [isOpen])

    function handleEnter(e) {
        if (e.key === "Enter") {
            if (newDeviceId.trim() === "") return
            saveDevice()
            setIsOpen(false)
        }
    }
    async function saveDevice() {
        await window.electron.ipcRenderer.invoke('add-device', { id: newDeviceId, status: "available", workingDuration: 0, notes: newDeviceNotes })
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
        setIsOpen(false)
    }

    async function deleteDevice(index) {
        await window.electron.ipcRenderer.invoke('delete-device', index)
        window.electron.ipcRenderer.invoke('get-devices').then(setDevices)
    }


    function handleSave() {
        onClose();
    }


    function getWorkingDuration(deviceId) {
        return clients
            .filter(c => c.device === deviceId)
            .reduce((total, c) => total + Number(c.duration), 0)
    }

    return (<>


        <div className="grid grid-cols-4 mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
            <div className="flex justify-start items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].device}</p>
            </div>
            <div className="flex justify-start items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].status}</p>
            </div>
            <div className="flex justify-start items-center  gap-1 text-sm font-semibold text-gray-600">
                <p>{t[lang].usedFor}</p>
            </div>
            <div className="flex justify-end">
                <div onClick={() => {
                    setNewDeviceId("")
                    setEditIndex(null)
                    setIsOpen(true)
                }} className="flex items-center gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-indigo-500">
                    <Plus size={16} /><span>{t[lang].addNew}</span>
                </div>
            </div>
        </div>

        <ModalDevices isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New device">
            <div className="flex flex-col gap-4">
                <input
                    onKeyDown={(e) => handleEnter(e)}
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value)}
                    className={`border rounded-lg p-2 text-sm ${newDeviceId.trim() === "" ? "border-red-300" : "border-gray-200"}`}
                    placeholder={t[lang].idNumber}
                    id="device"
                />
                <textarea
                    value={newDeviceNotes}
                    onChange={(e) => setNewDeviceNotes(e.target.value)}
                    className="border border-gray-200 rounded-lg p-2 text-sm"
                    placeholder="Condition notes"
                    rows={3}
                />
                <button
                    onClick={() => {
                        if (newDeviceId.trim() === "") return
                        saveDevice()
                        setIsOpen(false)
                    }}
                    className="bg-indigo-400 text-white rounded-lg py-2 hover:bg-indigo-500">
                    {t[lang].save}
                </button>
            </div>
        </ModalDevices>



        <div className="flex flex-col mx-2 mt-1">
            {devices.map((device, index) => (
                <div key={index} className="grid grid-cols-4 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-800 col-span-1">{device.id}</p>
                    <div className="col-span-1 flex justify-start">
                        <span className={`text-xs px-2 py-0.5 rounded-full shadow-md ${device.status === "available" ? "bg-green-100 text-green-600 shadow-green-300" : "bg-red-100 text-red-600 shadow-red-300"}`}>
                            {device.status === "available" ? t[lang].available : t[lang].inUse}
                        </span>
                    </div>
                    <p className="text-sm text-gray-800 col-span-1">{getWorkingDuration(device.id)} {t[lang].days}</p>
                    <div className="col-span-1 flex justify-end gap-2">
                        <X onClick={() => deleteDevice(index)} className="text-red-400 cursor-pointer hover:text-red-700" />
                    </div>
                </div>
            ))}
        </div>
    </>);
}
