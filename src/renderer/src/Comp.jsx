import { Sidebar, Sidebaritems } from "./Sidebar";
import { Boxes, List, Frame } from 'lucide-react';
import {Display} from "./Display";

function Comp() {
  return (
    <>
      <main className=" h-screen w-full flex flex-col font-sans bg-slate-300">
        <header className="  h-10  bg-white rounded-xl mx-2 mt-2 shadow-sm shadow-slate-500">
          <div className="w-full h-full flex flex-row justify-start items-center pl-5">
            <Frame />
            <p className="font-medium text-xl pl-2">brand name</p>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden  ">
          
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
