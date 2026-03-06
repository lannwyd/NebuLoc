import { Plus, ChevronDown, ChevronUp, X, Pencil, Bell } from "lucide-react";
import { useState } from "react";
import ModalClients from "./ModalClients";

export function DisplayClients() {
    const [isOpen, setIsOpen] = useState(false);
    const data = [
        { name: "zegrour abdelghani", number: "0661875954", device: "1123112344567789", checkoutDate: "2024-01-15", duration: 10, guaranteed: true, isDue: true, Amount: 500 },
        { name: "Jane Smith", number: "0771875954", device: "1123112344508789", checkoutDate: "2025-01-20", duration: 10, guaranteed: true, isDue: true, Amount: 500 },
    ]
    const devices = ["1123112344567731", "1123112344508789", "1123112374367772", "1123112214567744"]
    function handleSave() {
        onClose();
    }

    return (<>


        <div id="stats" className="w-full h-auto flex flex-row items-center justify-center">
            <div className="card">Devices in use : 10</div>
            <div className="card">Devices in use : 10</div>
            <div className="flex justify-end mx-2 h-full">
                <div onClick={() => setIsOpen(true)} className="flex items-center  gap-1 bg-indigo-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-indigo-500">
                    <Plus size={16} /><span>Add New</span>
                </div>
            </div>
        </div>

        <ModalClients isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Client">
            <div className="flex flex-col gap-4">
                <input className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Name" />
                <input className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Phone number" />

                <select className="border appearance-none border-gray-200 rounded-lg p-2 text-sm text-gray-600">
                    <option value="">Select Device</option>
                    {devices.map((device, index) => (
                        <option key={index} value={device}>{device}</option>
                    ))}
                </select>
                <input className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="Checkout Date" type="date" />
                <div className="flex justify-between items-baseline">
                    <label htmlFor="duration">Duration : ( days )</label>
                    <input className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="duration" min={"1"} type="number" id="duration" />
                </div>
                <input className="border border-gray-200 rounded-lg p-2 text-sm " placeholder="Paid Amount" min={"0"} type="number" id="duration" />


                <div className=" flex text-base  px-2  ">
                    <input className="scale-150 cursor-pointer accent-indigo-400" type="checkbox" id="insured" />
                    <label className=" ml-4" htmlFor="insured">did the client pay the insurance ( 2000 DA)</label>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="bg-indigo-400 text-white rounded-lg py-2 hover:bg-indigo-500">
                    Save
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
                <Bell size={16}/> <ChevronDown className="" size={16} />
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
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center">{item.checkoutDate}</p>
                    <p className="text-sm text-gray-800 col-span-2 flex items-start justify-center ">{item.guaranteed.toString()}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.Amount}</p>
                    <p className="text-sm text-gray-800 col-span-1 flex items-start justify-center">{item.isDue.toString()}</p>
                    <div className="flex justify-end gap-2">
                        <Pencil onClick={() => setIsOpen(true)} className="text-indigo-500 w-4  cursor-pointer hover:text-indigo-800" />
                        <X className="text-red-400  cursor-pointer hover:text-red-700" />
                    </div>
                </div>
            ))}
        </div>


    </>);
}
