import { Sidebar, Sidebaritems } from "./Sidebar";
import { Boxes, List, Search, CircleUserRound, Info ,BookmarkCheck} from 'lucide-react';
import { DisplayClients } from "./DisplayClients";
import { Devices } from "./Devices";
import { Availability } from "./Availability";
import { Dashboard } from "./Dashboard";
import { useLang } from './context/LanguageContext'
import { useState } from "react";
import { t } from './lang/translations'
import icon from './assets/imgs/icon.png'
import { Reservations } from "./Reservations";



function Comp() {

  const [activePage, setactivePage] = useState("Reservations");
  const { lang, setLang } = useLang();
  return (
    <>
      <main className=" h-screen w-full flex flex-col font-sans bg-slate-300">
        <header className="  h-10  bg-white rounded-xl mx-2 mt-2 shadow-sm shadow-slate-500">
          <div className="w-full h-full flex flex-row justify-between items-center px-5">


            <div className="flex flex-row items-center">
              <img className="w-[6%]" src={icon} />
              <p className="font-medium text-xl pl-2">{t[lang].brandName}</p>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
              <button className="px-2 py-1 rounded-lg bg-indigo-200 hover:bg-indigo-400" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
                {lang === "en" ? "العربية" : "English"}
              </button>
              <div className="relative group">
                <Info className="cursor-pointer text-slate-400 hover:text-slate-600" />
                <div className={`absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl p-4 shadow-lg z-50
                opacity-0 scale-95 pointer-events-none
                group-hover:opacity-100 group-hover:scale-100
                transition-all duration-200 ${lang === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-sm">
                        {t[lang].amount}
                      </span>
                      <span className="text-sm px-2 py-0.5  ">
                        250
                      </span>
                      <p className="text-sm text-gray-600">{t[lang].amountInfo}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm ">
                        {t[lang].bill}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-400 shrink-0 mt-0.5">
                        250
                      </span>
                      <p className="text-sm text-gray-600">{t[lang].billInfo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>




          </div>
        </header>
        <div className="flex flex-1 overflow-hidden  ">

          <Sidebar>
            <Sidebaritems icon={<List />} text={t[lang].clients} active={activePage === "clients"} onClick={() => setactivePage("clients")} />
            <Sidebaritems icon={<Boxes />} text={t[lang].devices} active={activePage === "devices"} onClick={() => setactivePage("devices")} />
            <Sidebaritems icon={<Search />} text={t[lang].availability} active={activePage === "availability"} onClick={() => setactivePage("availability")} />
            <Sidebaritems icon={<BookmarkCheck />} text={t[lang].reservations} active={activePage === "reservations"} onClick={() => setactivePage("reservations")} />
            <Sidebaritems icon={<CircleUserRound />} text={t[lang].dashboard} active={activePage === "dashboard"} onClick={() => setactivePage("dashboard")} />
          </Sidebar>
          <div id="display" className="flex flex-col flex-1 overflow-y-auto py-4 px-3 m-2 ml-1 bg-white shadow-sm shadow-slate-500 rounded-2xl">
            <div key={activePage} className="flex flex-col flex-1 animate-fadeIn">
              {activePage === "clients" ? <DisplayClients /> : activePage === "devices" ? <Devices /> : activePage === "availability" ? <Availability /> : activePage === "dashboard" ? <Dashboard /> : activePage === "Reservations" ? <Reservations /> : ""}

            </div>
          </div>

        </div>
      </main>
    </>
  );
}
export default Comp;
