import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ScatterDataPoint,
  ChartComponentLike,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

function BaseLine({
  data,
  isLegend,
  title,
}: {
  data: ChartData<'line', (number | ScatterDataPoint | null)[], unknown>;
  isLegend?: boolean;
  title: string;
}) {
  let register: ChartComponentLike = {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
  };
  if (isLegend) {
    register = { ...register, Legend };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  ChartJS.register({ ...register });

  return <Line options={options} data={data} />;
}
export default BaseLine;
