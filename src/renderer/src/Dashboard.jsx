import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { useEffect, useState } from 'react'

ChartJS.register(Filler, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)  // Filler is here ✓

export function Dashboard() {
    const [monthlyData, setMonthlyData] = useState(Array(12).fill(0))
    const [clients, setClients] = useState([])
    function calculateMoney() {
        return monthlyData.reduce((total, current) => total + current, 0);
    }

    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
            label: "Money",
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
                displayColors:false,
                callbacks: {
                    title: (context) => {
                        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][context[0].dataIndex]
                    },
                    label: (context) => {
                        const monthClients = clients.filter(c =>
                            new Date(c.checkoutDate).getMonth() === context.dataIndex
                        )
                        return [
                            `Total: ${context.parsed.y} DA`,
                            `Devices used: ${monthClients.length}`
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
            <div className="mx-2 mt-4 bg-white rounded-lg p-4 ">
                <div className="mx-2 mt-4 bg-gray-100 rounded-lg p-4">
                    <Line data={data} options={options} />
                </div>
                <div className="mx-2 mt-4 bg-gray-100 rounded-lg p-4 ">
                    <p className='text-xl font-sans font-medium'>Total Earned Money : {calculateMoney()} DA</p>
                </div>
            </div>
        </>
    );
}