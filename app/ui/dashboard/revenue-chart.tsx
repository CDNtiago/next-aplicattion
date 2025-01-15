'use client';

import { lusitana } from '@/app/ui/fonts';
import { Revenue } from '@/app/lib/definitions';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar componentes do Chart.js fora do componente
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function RevenueChart({ revenue }: { revenue: Revenue[] }) {
  // Estado para controlar se estamos no cliente
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = {
    labels: revenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: revenue.map(item => item.revenue),
        backgroundColor: 'rgb(59, 130, 246)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
        ticks: {
          callback: (value: number) => `$${value / 1000}K`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div style={{ height: '350px' }}>
          {isClient ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div>Loading...</div>
          )}
        </div>
        
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Last 12 months</h3>
        </div>
      </div>
    </div>
  );
}
