import { Plus } from "lucide-react";

export function Display() {
    return (<>
        <div id="display" className="rounded-2xl  flex-1 overflow-y-auto p-4 m-2 ml-1 bg-white shadow-sm shadow-slate-500">
            <div id="stats" className="w-full h-auto flex flex-row items-center justify-center">
                <div className="card">Devices in use : 10</div>
                <div className="card">Devices in use : 10</div>
                <div className="card">Devices in use : 10</div>
            </div>
            <div className="flex flex-row justify-end items-center  bg-slate-400 my-4">
                <div  className="flex flex-row justify-end items-center h-full bg-indigo-400 rounded-lg py-1 px-2 mr-2 cursor-pointer hover:bg-indigo-500">
                    <span><Plus /></span>
                    <span className="">Add New</span>
                </div>

                
            </div>
            <ul id="Clients-display">
                <li className=""></li>
            </ul>


        </div>
    </>);
}
