import React from 'react';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ScatterDataPoint,
} from 'chart.js';
import ChartJS from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function BaseLine({
  data,
  isLegend,
  title,
  yAxesCallbackFunc,
  tooltipCallbackFunc,
}: {
  data: ChartData<'line', (number | ScatterDataPoint | null)[], unknown>;
  isLegend?: boolean;
  title: string;
  yAxesCallbackFunc?: any;
  tooltipCallbackFunc?: any;
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
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
      },
    },
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
          callback: yAxesCallbackFunc,
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
        labels: {
          boxWidth: 10,
          display: isLegend,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 10,
          font: {
            size: 12,
            family: 'Inter',
            color: 'rgb(134, 147, 157)',
          },
        },
        position: 'botton',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        position: 'average',
        backgroundColor: 'rgba(0,0,0,0.7)',
        callbacks: tooltipCallbackFunc,
        caretSize: 10,
        caretPadding: 10,
        titleFontFamily: 'Inter',
        bodyFontFamily: 'Inter',
        usePointStyle: false,
        titleColor: '#fff',
        borderColor: 'rgba(54,54,54,0.20)',
        borderWidth: 2.5,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Line options={options} data={data} />;
}
export default BaseLine;
