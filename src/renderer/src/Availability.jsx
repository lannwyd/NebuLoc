import { useState, useEffect } from "react";
import searching from "./assets/searching.json"
import notfound from "./assets/notfound.json"
import { Player } from "@lottiefiles/react-lottie-player"



export function Availability() {
    const [allDevices, setAllDevices] = useState();
    const [clients, setClients] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [duration, setDuration] = useState(0);
    const [results, setResults] = useState(null);

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-devices').then(setAllDevices)
        window.electron.ipcRenderer.invoke('get-clients').then(setClients)
    }, [])

    function displayData() {

    }
    function isDeviceAvailable(deviceId, startDate, duration) {
        const reqStart = new Date(startDate)
        const reqEnd = new Date(startDate)
        reqEnd.setDate(reqEnd.getDate() + Number(duration))

        const conflict = clients.some(client => {
            const clientStart = new Date(client.checkoutDate)
            const clientEnd = new Date(client.checkoutDate)
            clientEnd.setDate(clientEnd.getDate() + Number(client.duration))
            if (client.device !== deviceId) return false
            if (client.status === "done") return false

            return reqStart <= clientEnd && reqEnd >= clientStart
        })
        return !conflict
    }

    function search() {
        if (!startDate || !duration) return
        const available = allDevices.filter(device => (
            isDeviceAvailable(device.id, startDate, duration)
        ))
        setResults(available)

    }
    function getWorkingDuration(deviceId) {
        return clients
            .filter(c => c.device === deviceId)
            .reduce((total, c) => total + Number(c.duration), 0)
    }


    return (
        <>
            <div className="grid grid-cols-6 mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
                <label className="flex items-center" htmlFor="range">Enter the date :</label>
                <input onChange={e => setStartDate(e.target.value)} value={startDate} className="border border-gray-200 rounded-lg p-2 text-sm" type="date" id="range" />
                <p className="flex justify-center items-center font-bold text-xl ">-</p>
                <label className="flex items-center" htmlFor="duration">Enter the date :</label>
                <input onChange={e => setDuration(e.target.value)} value={duration} className="border border-gray-200 rounded-lg p-2 text-sm " type="number" placeholder="Days" min={0} />
                <div onClick={() => search()} className="flex justify-end mx-2 h-full">
                    <div className="flex items-center justify-center w-28  gap-1 bg-green-400 text-white rounded-lg py-1 px-3 cursor-pointer transition-colors hover:bg-green-500">
                        <span>Search</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col mx-2 mt-1 ">
                {
                    results === null ? (
                        <Player autoplay loop src={searching} style={{ height: 400 }} />
                    ) : results.length == 0 ?
                        (<>
                            <Player autoplay loop src={notfound} style={{ height: 300 }} />
                            <p className="text-center text-2xl text-gray-500 font-semibold">No Devices Available In That Period</p>
                        
                        </>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 mx-2 mt-4 bg-gray-100 rounded-lg px-3 py-2">
                                    <div className="flex justify-start items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                                        <p>Device</p>
                                    </div>
                                    <div className="flex justify-start items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600">
                                        <p>Used For</p>
                                    </div>
                                    <div className="flex justify-end items-center cursor-pointer gap-1 text-sm font-semibold text-gray-600 pr-3">
                                        <p>Will Be</p>
                                    </div>
                                </div>
                                <div className="flex flex-col mx-2 mt-1">
                                    {results.map((e, i) => (
                                        <div key={i} className="grid grid-cols-3 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ">
                                            <p className="text-sm text-gray-800 col-span-1">{e.id}</p>

                                            <p className="text-sm text-gray-800 col-span-1">{getWorkingDuration(e.id)} days</p>
                                            <div className="col-span-1 flex justify-end">
                                                <span className={"text-xs px-2 py-0.5 rounded-full shadow-md bg-green-100 text-green-600 shadow-green-300"}>
                                                    Available
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>

                        )
                }
            </div>
        </>
    );
}
