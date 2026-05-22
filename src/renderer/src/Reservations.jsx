import { Plus, ChevronDown, ChevronUp, X, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import ModalDevices from "./ModalDevices"
import { useLang } from './context/LanguageContext'
import { t } from './lang/translations'

export function Reservations() {
    const [isOpen, setIsOpen] = useState(false);
    const [newReservation, setNewReservation] = useState({ name: "", number: "", address: "" });
    const [Reservations, setReservations] = useState([]);
    const [editIndex, setEditIndex] = useState(null);


    const { lang } = useLang();


    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-reservations').then(setReservations)
    }, [])

    async function saveReservation() {
        if (!newReservation.name) return;
        await window.electron.ipcRenderer.invoke('add-reservation', newReservation)
        window.electron.ipcRenderer.invoke('get-reservations').then(setReservations)
        setNewReservation({ name: "", number: "", address: "" });
    }

    async function deleteReservation(index) {
        await window.electron.ipcRenderer.invoke('delete-reservation', index)
        window.electron.ipcRenderer.invoke('get-reservations').then(setReservations)
    }


    function handleEnter(e, nextId) {
        if (e.key === 'Enter') {
            document.getElementById(nextId)?.focus()
        }
    }

    return (
        <>
            <div className="grid grid-cols-4 mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex justify-start items-center  gap-1 text-sm font-semibold text-gray-600">
                    <p>{t[lang].name}</p>
                </div>
                <div className="flex justify-start items-center  gap-1 text-sm font-semibold text-gray-600">
                    <p>{t[lang].number}</p>
                </div>
                <div className="flex justify-start items-center  gap-1 text-sm font-semibold text-gray-600">
                    <p>{t[lang].address}</p>
                </div>
                <div className="flex justify-end">
                    <div onClick={() => {
                        setNewReservation({ name: "", number: "", address: "" })
                        setEditIndex(null)
                        setIsOpen(true)
                    }}
                        className="flex items-center gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-indigo-500">
                        <Plus size={16} /><span>{t[lang].addNew}</span>
                    </div>
                </div>
            </div>

            <ModalDevices isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New device">
                <div className="flex flex-col gap-4">
                    <input onKeyDown={(e) => handleEnter(e, 'number')}
                        autoFocus id="name" value={newReservation.name} onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
                        className="border border-gray-200 rounded-lg p-2 text-sm" placeholder={t[lang].name} />
                    <input onKeyDown={(e) => handleEnter(e, 'address')} id="address" value={newReservation.number} onChange={(e) => setNewReservation({ ...newReservation, number: e.target.value })}
                        className="border border-gray-200 rounded-lg p-2 text-sm" placeholder={t[lang].number} />
                    <input
                        id="address" value={newReservation.address} onChange={(e) => setNewReservation({ ...newReservation, address: e.target.value })}
                        className="border border-gray-200 rounded-lg p-2 text-sm" placeholder={t[lang].address} />

                    <button
                        onClick={() => { saveReservation(); setIsOpen(false); }}
                        className="bg-indigo-400 text-white rounded-lg py-2 hover:bg-indigo-500">
                        {t[lang].save}
                    </button>
                </div>
            </ModalDevices>



            <div className="flex flex-col mx-2 mt-1">
                {Reservations.map((res, index) => (
                    <div key={index} className="grid grid-cols-4 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <p className="text-sm text-gray-800">{res.name}</p>
                        <p className="text-sm text-gray-800">{res.number}</p>
                        <p className="text-sm text-gray-800">{res.address}</p>

                        <div className="col-span-1 flex justify-end gap-2">
                            <X onClick={() => deleteReservation(index)} className="text-red-400 cursor-pointer hover:text-red-700" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
