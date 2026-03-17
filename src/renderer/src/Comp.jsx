import { Sidebar, Sidebaritems } from "./Sidebar";
import { Boxes, List, Frame, Search, Bell, CircleUserRound } from 'lucide-react';
import { DisplayClients } from "./DisplayClients";
import { Devices } from "./Devices";
import { Availability } from "./Availability";
import { Dashboard } from "./Dashboard";
import { useLang } from './context/LanguageContext'
import { useState } from "react";
import { t } from './lang/translations'


function Comp() {

  const [activePage, setactivePage] = useState("clients");
  const { lang, setLang } = useLang();
  return (
    <>
      <main className=" h-screen w-full flex flex-col font-sans bg-slate-300">
        <header className="  h-10  bg-white rounded-xl mx-2 mt-2 shadow-sm shadow-slate-500">
          <div className="w-full h-full flex flex-row justify-between items-center px-5">


            <div className="flex flex-row items-center">
              <Frame />
              <p className="font-medium text-xl pl-2">{t[lang].brandName}</p>
            </div>
            <button className="px-2 py-1 rounded-lg bg-indigo-200 hover:bg-indigo-400" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
              {lang === "en" ? "العربية" : "English"}
            </button>



          </div>
        </header>
        <div className="flex flex-1 overflow-hidden  ">

          <Sidebar>
            <Sidebaritems icon={<List />} text = {t[lang].clients} active={activePage === "clients"} onClick={() => setactivePage("clients")} />
            <Sidebaritems icon={<Boxes />} text={t[lang].devices} active={activePage === "devices"} onClick={() => setactivePage("devices")} />
            <Sidebaritems icon={<Search />} text={t[lang].availability} active={activePage === "availability"} onClick={() => setactivePage("availability")} />
            <Sidebaritems icon={<CircleUserRound />} text={t[lang].dashboard} active={activePage === "dashboard"} onClick={() => setactivePage("dashboard")} />
          </Sidebar>
          <div id="display" className="flex flex-col flex-1 overflow-y-auto py-4 px-3 m-2 ml-1 bg-white shadow-sm shadow-slate-500 rounded-2xl">
            <div key={activePage} className="flex flex-col flex-1 animate-fadeIn">
              {activePage === "clients" ? <DisplayClients /> : activePage === "devices" ? <Devices /> : activePage === "availability" ? <Availability /> : activePage === "dashboard" ? <Dashboard /> : ""}

            </div>
          </div>

        </div>
      </main>
    </>
  );
}
export default Comp;
