import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { useEffect, useState } from 'react'
import { useLang } from './context/LanguageContext'
import { t } from './lang/translations'
import { CircleDollarSign } from "lucide-react";



ChartJS.register(Filler, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)  // Filler is here ✓

export function Dashboard() {
    const [monthlyData, setMonthlyData] = useState(Array(12).fill(0))
    const [clients, setClients] = useState([])
    const { lang } = useLang()

    function calculateMoney() {
        return monthlyData.reduce((total, current) => total + current, 0);
    }

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
    }, [])

    return (
        <>
            <div className='grid h-full grid-cols-2 rounded-lg grid-rows-2 bg-slate-200'>
                <div></div>
                <div className="  flex flex-col bg-white justify-center items-center">
                    <div className='flex flex-col '>
                        <p className='text-xl font-sans font-medium'>{t[lang].totalMoney} : </p>
                    </div>
                    <div className='flex flex-row justify-center items-center text-indigo-500 font-[900] text-5xl'>
                        <CircleDollarSign className='text-indigo-500' size={60} />
                        <p className=''>{calculateMoney()} DA</p>
                    </div>


                </div>
                <div className="">
                    <div className="  bg-gray-100 rounded-lg ">
                        <Line data={data} options={options} />
                    </div>
                </div>
                <div></div>

            </div>

        </>
    );
}