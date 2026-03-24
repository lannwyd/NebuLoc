import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { createContext, useContext, useState } from 'react';
import { useLang } from './context/LanguageContext'
import { t } from './lang/translations'


const Sidebarcontext = createContext();
export function Sidebar({ children }) {
    const [expanded, setexpanded] = useState(true);
    const { lang } = useLang()


    function toggleexpanded() {
        setexpanded(prev => !prev);
    }


    return (
        <>
            <div id="side-bar" className={`${expanded ? "w-[25%] lg:w-[20%]" : "w-16"}   flex flex-col bg-white rounded-xl m-2 mr-1 shadow-sm shadow-slate-500 transition-all duration-300`}>
                <div className="p-4 flex justify-center items-center ">
                    <p className={`${expanded ? "ml-2 w-54" : "w-0"} overflow-hidden transition-all duration-300 flex-1 font-medium text-2xl`}>{t[lang].overview}</p>
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

export function Sidebaritems({ icon, text, active, alert, onClick }) {
    const { expanded } = useContext(Sidebarcontext);

    return (
        <li onClick={onClick} className={`relative flex gap-2 items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ?
            "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"} ${expanded ? "" : " justify-center"}`}>
            <span className={`${expanded ? "" : "flex-1"} shrink-0`}>{icon}</span>
            <span className={`${expanded ? "ml-2 w-54" : "w-0"} overflow-hidden transition-all duration-300`}>{text}</span>
            {!expanded &&
                <div className='absolute left-full rtl:left-auto rtl:right-full 
                    rounded-lg px-2 py-1 
                    ml-6 rtl:ml-0 rtl:mr-6 
                    bg-indigo-100 text-indigo-600 text-sm
                    invisible opacity-20 
                    -translate-x-3 rtl:translate-x-3 
                    transition-all 
                    group-hover:visible group-hover:opacity-100 group-hover:translate-x-0'>
                    {text}
                </div>
            }
        </li>
    );
}