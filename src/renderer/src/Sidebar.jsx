import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { createContext, useContext, useState } from 'react';



const Sidebarcontext = createContext();
export function Sidebar({ children }) {
    const [expanded, setexpanded] = useState(true);

    function toggleexpanded() {
        setexpanded(prev => !prev);
    }


    return (
        <>
            <div id="side-bar" className={`${expanded ? "w-[25%] lg:w-[20%]" : "w-16"} h-full flex flex-col bg-white border-r-[1px] border-gray-500 shadow-sm shadow-black transition-all duration-300`}>
                <div className="p-4 flex justify-center items-center ">
                    <p className= {`${expanded ? "ml-2 w-54" : "w-0"} overflow-hidden transition-all duration-300 flex-1 font-medium text-2xl`}>Overview</p>
                    <button className="p-1.5 rounded-lg bg-indigo-200 hover:bg-indigo-400" onClick={toggleexpanded}>
                        {expanded ? <PanelLeftClose /> : <PanelRightClose />}
                    </button>
                </div>

                <Sidebarcontext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3">
                        {children}
                    </ul>
                </Sidebarcontext.Provider>
            </div>

        </>
    );
}

export function Sidebaritems({ icon, text, active, alert }) {
    const { expanded } = useContext(Sidebarcontext);

    return (
        <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ?
            "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"} ${expanded ? "" : " justify-center"}`}>
            <span className={`${expanded ? "" : "flex-1"} shrink-0`}>{icon}</span>
            <span className={`${expanded ? "ml-2 w-54" : "w-0"} overflow-hidden transition-all duration-300`}>{text}</span>
            {!expanded &&
                <div className='absolute left-full rounded-lg px-2 py-1 ml-6 bg-indigo-100 text-indigo-600 text-sm
        invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0'>{text}
                </div>}
        </li>
    );
}