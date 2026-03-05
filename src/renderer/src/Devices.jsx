import { Plus, ChevronDown, ChevronUp, X, Pencil } from "lucide-react";
import { useState } from "react";

export function Devices() {
    
    const devices = ["1123112344567731", "1123112344508789", "1123112374367772", "1123112214567744"]
    function handleSave() {
        onClose();
    }

    return (<>
            <div id="stats" className="w-full h-auto flex flex-row items-center justify-center">
                <div className="card">Devices in use : 10</div>
                <div className="card">Devices in use : 10</div>
                <div className="card">Devices in use : 10</div>
            </div>

            <div className="grid grid-cols-2 mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex justify-start items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                    <p>Device</p><ChevronDown size={16} />
                </div>
                <div className="flex justify-end">
                    <div onClick={() => setIsOpen(true)} className="flex items-center gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer hover:bg-indigo-500">
                        <Plus size={16} /><span>Add New</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col mx-2 mt-1">
                {devices.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <p className="text-sm text-gray-800"></p>
                        <div className="flex justify-end gap-2">
                            <Pencil onClick={() => setIsOpen(true)} className="text-indigo-500 w-4  cursor-pointer hover:text-indigo-800" />
                            <X className="text-red-400  cursor-pointer hover:text-red-700" />
                        </div>
                    </div>
                ))}
            </div>
    </>);
}
