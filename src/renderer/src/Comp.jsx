import { Sidebar, Sidebaritems } from "./Sidebar";
import { Boxes, List, Frame } from 'lucide-react';
import {Display} from "./Display";

function Comp() {
  return (
    <>
      <main className=" h-screen flex flex-col bg-slate-500 font-sans">
        <header className=" w-full h-10  bg-white border-gray-500 border-b-[1px] ">
          <div className="w-full h-full flex flex-row justify-start items-center pl-5">
            <Frame />
            <p className="font-medium text-xl pl-2">brand name</p>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden bg-white">
          <Sidebar>
            <Sidebaritems icon={<Boxes />} text="Devices" active={true} ></Sidebaritems>
            <Sidebaritems icon={<List />} text="Clients"></Sidebaritems>
          </Sidebar>
          <Display></Display>
        </div>
      </main>
    </>
  );
}
export default Comp;
