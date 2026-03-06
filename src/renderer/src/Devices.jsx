import { Plus, ChevronDown, ChevronUp, X, Pencil } from "lucide-react";
import { useState } from "react";
import ModalDevices from "./ModalDevices"

export function Devices() {
    const [isOpen, setIsOpen] = useState(false);

    const devices = ["1123112344567731", "1123112344508789", "1123112374367772", "1123112214567744"]
    function handleSave() {
        onClose();
    }

    return (<>
        

        <div className="grid grid-cols-2 mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
            <div className="flex justify-start items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                <p>Device</p><ChevronDown size={16} />
            </div>
            <div className="flex justify-end">
                <div onClick={() => setIsOpen(true)} className="flex items-center gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-indigo-500">
                    <Plus size={16} /><span>Add New</span>
                </div>
            </div>
        </div>
        <ModalDevices isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Device">
            <div className="flex flex-col gap-4">
                <input className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="id number" />
                
                <button
                    onClick={() => setIsOpen(false)}
                    className="bg-indigo-400 text-white rounded-lg py-2 hover:bg-indigo-500">
                    Save
                </button>
            </div>
        </ModalDevices>



        <div className="flex flex-col mx-2 mt-1">
            {devices.map((item, index) => (
                <div key={index} className="grid grid-cols-2 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-800">{item}</p>
                    <div className="flex justify-end gap-2">
                        <Pencil onClick={() => setIsOpen(true)} className="text-indigo-500 w-4  cursor-pointer hover:text-indigo-800" />
                        <X className="text-red-400  cursor-pointer hover:text-red-700" />
                    </div>
                </div>
            ))}
        </div>
    </>);
}
