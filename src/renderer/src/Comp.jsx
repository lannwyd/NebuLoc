import { Sidebar, Sidebaritems } from "./Sidebar";
import { Boxes, List, Frame } from 'lucide-react';
import { DisplayClients } from "./DisplayClients";
import { Devices } from "./Devices";

import { useState } from "react";

function Comp() {

  const [activePage, setactivePage] = useState("clients");

  return (
    <>
      <main className=" h-screen w-full flex flex-col font-sans bg-slate-300">
        <header className="  h-10  bg-white rounded-xl mx-2 mt-2 shadow-sm shadow-slate-500">
          <div className="w-full h-full flex flex-row justify-between items-center px-5">
            <div className="flex flex-row items-center">
              <Frame />
              <p className="font-medium text-xl pl-2">brand name</p>
            </div>

            <div onClick={() => setactivePage("dashboard")} className={`${activePage === "dashboard" ? "bg-gradient-to-tr from-indigo-200 to-indigo-100" : "bg-white"} flex flex-row items-center  p-1 rounded-xl cursor-pointer transition-colors hover:bg-indigo-50`}>
              <p className="pr-1 font-medium text-indigo-800">User Dashboard</p>
              <img src="" alt="logo" />
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden  ">

          <Sidebar>
            <Sidebaritems icon={<List />} text="Clients" active={activePage === "clients"} onClick={() => setactivePage("clients")} />
            <Sidebaritems icon={<Boxes />} text="Devices" active={activePage === "devices"} onClick={() => setactivePage("devices")} />
          </Sidebar>
          <div id="display" className="flex flex-col flex-1 overflow-y-auto py-4 px-3 m-2 ml-1 bg-white shadow-sm shadow-slate-500 rounded-2xl">
            <div key={activePage} className="flex flex-col flex-1 animate-fadeIn">
              {activePage === "clients" ? <DisplayClients /> : activePage === "devices" ? <Devices /> : ""}

            </div>
          </div>

        </div>
      </main>
    </>
  );
}
export default Comp;
