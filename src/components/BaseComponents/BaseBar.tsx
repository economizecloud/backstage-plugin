import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ScatterDataPoint,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { color } from '../../ulits/ulits';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
function BaseBar({
  data,
  isLegend,
  title,
}: {
  data: ChartData<'bar', (number | ScatterDataPoint | null)[], unknown>;
  isLegend?: boolean;
  title: string;
}) {
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 20,
    elements: {
      line: {
        tension: 0,
      },
      point: {
        display: true,
        backgroundColor: 'rgb(252, 152, 3)',
        radius: 0,
        hitRadius: 5,
        hoverRadius: 7,
      },
    },
    pointStyle: 'circle',
    hover: { intersect: false },
    scales: {
      x: {
        display: true,
        color: 'rgb(134, 147, 157)',
        borderDash: [2, 2],
        grid: {
          zeroLineColor: 'rgba(217, 217, 217,0.25)',
          color: 'rgba(217, 217, 217,0.6)',
          borderDash: [2, 2],
          drawTicks: false,
        },
        ticks: {
          beginAtZero: true,
          font: {
            size: 12,
            family: 'Inter',
            color: 'rgb(134, 147, 157)',
          },
          padding: 10,
          fontFamily: 'Inter',
          maxTicksLimit: 15,
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
        pointLabels: {
          fontFamily: 'Inter',
        },
      },
      y: {
        display: true,
        color: 'rgb(134, 147, 157)',
        grid: {
          zeroLineColor: 'rgba(238, 238, 238,0.6)',
          drawTicks: false,
          color: 'rgba(238, 238, 238,0.6)',
        },
        ticks: {
          beginAtZero: true,
          font: {
            size: 12,
            family: 'Inter',
            color: 'rgb(134, 147, 157)',
          },
          padding: 10,
          maxTicksLimit: 8,
        },
        pointLabels: {
          fontFamily: 'Inter',
        },
      },
    },
    animation: {
      x: {
        duration: 1500,
        from: 0,
      },
      y: {
        duration: 1500,
        from: 500,
      },
    },
    plugins: {
      legend: {
        display: isLegend,
        position: 'bottom',
        text: title,
        labels: {
          boxWidth: 10,
          display: true,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 10,
          font: {
            size: 12,
            family: 'Inter',
            color: 'rgb(134, 147, 157)',
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        position: 'nearest',
        backgroundColor: 'rgba(0,0,0,0.7)',
        caretSize: 10,
        caretPadding: 10,
        titleFontFamily: 'Inter',
        bodyFontFamily: 'Inter',
        usePointStyle: false,
        titleColor: '#fff',
        borderColor: 'rgba(54,54,54,0.20)',
        borderWidth: 2.5,
      },
    },
  };

  data.datasets = data.datasets.map((item, index) => {
    return {
      ...item,
      fill: true,
      pointStyle: 'circle',
      backgroundColor: color[index % color.length],
      borderColor: color[index % color.length],
      pointBackgroundColor: color[index % color.length],
      barThickness: 30,
      pointHoverRadius: 7,
      pointBorderWidth: 1,
      pointHoverBorderWidth: 4,
      pointHoverBackgroundColor: 'rgb(255, 255, 255)',
      categoryPercentage: 1.0,
      barPercentage: 0.7,
    };
  });

  return <Bar options={options} data={data} />;
}
export default BaseBar;
