import { Plus, ChevronDown, ChevronUp, X, Pencil } from "lucide-react";
import { useState } from "react";
import ModalClients from "./ModalClients";

export function DisplayClients() {
    const [isOpen, setIsOpen] = useState(false);
    const data = [
        { name: "zegrour abdelghani",number : "0661875954", device: "1123112344567789", checkoutDate: "2024-01-15" ,duration : 10 , guaranteed : true , isDue : true , Amount : 500},
        { name: "Jane Smith",number : "0771875954", device: "1123112344508789", checkoutDate: "2025-01-20" ,duration : 10 , guaranteed : true , isDue : true , Amount : 500},
    ]
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

            <ModalClients isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Client">
                <div className="flex flex-col gap-4">
                    <input className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Name" />
                    <select className="border appearance-none border-gray-200 rounded-lg p-2 text-sm text-gray-600">
                        <option value="">Select Device</option>
                        {devices.map((device, index) => (
                            <option key={index} value={device}>{device}</option>
                        ))}
                    </select>
                    <input className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="Checkout Date" type="date" />
                    <div className=" flex text-base  px-2  ">
                        <input className="scale-150 cursor-pointer accent-indigo-400" type="checkbox" id="insured" />
                        <label className=" ml-4" htmlFor="insured">did the client pay the insurance</label>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="bg-indigo-400 text-white rounded-lg py-2 hover:bg-indigo-500">
                        Save
                    </button>
                </div>
            </ModalClients>

            <div className="grid grid-cols-4 mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                    <p>Name</p><ChevronDown size={16} />
                </div>
                <div className="flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                    <p>Device</p><ChevronDown size={16} />
                </div>
                <div className="flex items-center cursor-pointer gap-1  text-sm font-semibold text-gray-600">
                    <p>Checkout Date</p><ChevronDown size={16} />
                </div>
                <div className="flex justify-end">
                    <div onClick={() => setIsOpen(true)} className="flex items-center gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer hover:bg-indigo-500">
                        <Plus size={16} /><span>Add New</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col mx-2 mt-1">
                {data.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-800">{item.device}</p>
                        <p className="text-sm text-gray-800">{item.checkoutDate}</p>
                        <div className="flex justify-end gap-2">
                            <Pencil onClick={() => setIsOpen(true)} className="text-indigo-500 w-4  cursor-pointer hover:text-indigo-800" />
                            <X className="text-red-400  cursor-pointer hover:text-red-700" />
                        </div>
                    </div>
                ))}
            </div>

        
    </>);
}
