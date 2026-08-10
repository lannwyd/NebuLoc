import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { useEffect, useState } from 'react'
import { useLang } from './context/LanguageContext'
import { t } from './lang/translations'
import { CircleDollarSign, Users, AlertTriangle, Server, CalendarClock } from "lucide-react";

ChartJS.register(Filler, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

export function Dashboard() {
    const [monthlyData, setMonthlyData] = useState(Array(12).fill(0))
    const [clients, setClients] = useState([])
    const [devices, setDevices] = useState([])
    const { lang } = useLang()

    function calculateDueDate(checkoutDate, duration) {
        if (!checkoutDate) return null
        const date = new Date(checkoutDate)
        if (isNaN(date.getTime())) return null
        date.setDate(date.getDate() + Number(duration))
        return date
    }

    function getClientStatus(duedate) {
        if (!duedate) return "still"
        const date = new Date(duedate)
        date.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today > date ? "due" : "still"
    }

    function calculateMoney() {
        return monthlyData.reduce((total, current) => total + current, 0)
    }

    const activeClients = clients.filter(c => {
        if (c.status === "done") return false
        const dueDate = calculateDueDate(c.checkoutDate, c.duration)
        return dueDate && getClientStatus(dueDate) === "still"
    }).length

    const overdueClients = clients.filter(c => {
        if (c.status === "done") return false
        const dueDate = calculateDueDate(c.checkoutDate, c.duration)
        return dueDate && getClientStatus(dueDate) === "due"
    })

    const availableDevices = devices.filter(d => d.status === "available").length

    const deviceEarnings = devices.map(device => {
        const earned = clients
            .filter(c => c.device === device.id)
            .reduce((sum, c) => sum + Number(c.Amount) + Number(c.Bill), 0)
        return { id: device.id, earned }
    }).sort((a, b) => b.earned - a.earned)

    const data = {
        labels: t[lang].months,
        datasets: [{
            label: t[lang].money,
            data: monthlyData,
            borderColor: "#818cf8",
            backgroundColor: "rgba(129, 140, 248, 0.1)",
            tension: 0.4,
            fill: true,
        }]
    }
    const options = {
        plugins: {
            tooltip: {
                backgroundColor: "rgb(92, 107, 192)",
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        return t[lang].months[context[0].dataIndex]
                    },
                    label: (context) => {
                        const monthClients = clients.filter(c =>
                            new Date(c.checkoutDate).getMonth() === context.dataIndex
                        )
                        return [
                            `${t[lang].total}: ${context.parsed.y} DA`,
                            `${t[lang].devicesUsed}: ${monthClients.length}`
                        ]
                    }
                }
            }
        }
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-clients').then((clients) => {
            setClients(clients)
            const monthly = Array(12).fill(0)
            clients.forEach(client => {
                if (!client.checkoutDate) return
                const month = new Date(client.checkoutDate).getMonth()
                monthly[month] += Number(client.Amount + client.Bill)
            })
            setMonthlyData(monthly)
        })
        window.electron.ipcRenderer.invoke('get-devices').then((devices) => {
            setDevices(devices)
        })
    }, [])

    return (
        <div className='grid h-[87vh] grid-cols-2 rounded-lg grid-rows-2 bg-slate-200 gap-1 p-1 '>
            <div className="bg-white rounded-lg p-4 flex flex-col gap-3 overflow-hidden">
                <p className='text-lg font-sans font-medium text-gray-700'>{t[lang].overview}</p>
                <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="bg-indigo-50 rounded-lg flex flex-col items-center justify-center gap-1 p-2">
                        <Users className="text-indigo-500" size={28} />
                        <p className="text-2xl font-bold text-indigo-600">{activeClients}</p>
                        <p className="text-xs text-gray-500 font-medium">{t[lang].activeClients}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg flex flex-col items-center justify-center gap-1 p-2">
                        <AlertTriangle className="text-red-500" size={28} />
                        <p className="text-2xl font-bold text-red-600">{overdueClients.length}</p>
                        <p className="text-xs text-gray-500 font-medium">{t[lang].overdueClients}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg flex flex-col items-center justify-center gap-1 p-2">
                        <Server className="text-emerald-500" size={28} />
                        <p className="text-2xl font-bold text-emerald-600">{availableDevices}</p>
                        <p className="text-xs text-gray-500 font-medium">{t[lang].devicesAvailable}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg flex flex-col items-center justify-center gap-1 p-2">
                        <CalendarClock className="text-amber-500" size={28} />
                        <p className="text-2xl font-bold text-amber-600">{clients.length}</p>
                        <p className="text-xs text-gray-500 font-medium">{t[lang].totalClients}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col bg-white justify-center items-center">
                <div className='flex flex-col '>
                    <p className='text-xl font-sans font-medium'>{t[lang].totalMoney} : </p>
                </div>
                <div className='flex flex-row justify-center items-center text-indigo-500 font-[900] text-5xl'>
                    <CircleDollarSign className='text-indigo-500' size={60} />
                    <p className='text-6xl'>{calculateMoney()} DA</p>
                </div>
            </div>
            <div className="">
                <div className="bg-gray-100 rounded-lg h-full">
                    <Line data={data} options={options} />
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 flex flex-col overflow-hidden ">
                <p className='text-lg font-sans font-medium text-gray-700 mb-2'>{t[lang].devices}</p>
                {deviceEarnings.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                        {t[lang].noDevices}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {deviceEarnings.map((device, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                                    <Server className="text-indigo-400" size={18} />
                                    <p className="text-sm font-semibold text-gray-800">{device.id}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CircleDollarSign className="text-emerald-500" size={16} />
                                    <p className="text-sm font-bold text-emerald-600">{device.earned} DA</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}