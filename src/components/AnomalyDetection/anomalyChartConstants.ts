import { formatWithCurrencyUnit } from '../../ulits/ulits';

const anomalyChartOptsConstants = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      tension: 0,
    },
    point: {
      display: true,
      backgroundColor: 'rgb(252, 152, 3)',
      pointHoverRadius: 15,
    },
  },
  pointStyle: 'circle',
  hover: { mode: 'nearest', intersect: true },
  scales: {
    x: {
      display: true,
      grid: {
        zeroLineColor: '#000000',
        lineWidth: 0,
      },
      ticks: {
        beginAtZero: true,
        font: {
          size: 12,
          family: 'Inter',
          color: 'rgb(134, 147, 157)',
        },
        padding: 15,
        autoSkip: true,
        maxTicksLimit: 11,
        maxRotation: 0,
        minRotation: 0,
        callback: function (label) {
          let realLabel = this.getLabelForValue(label);
          let timestamp, date, time;
          timestamp = new Date(Date.parse(realLabel));
          date =
            timestamp.getDate() +
            ' ' +
            timestamp.toLocaleString('en-us', { month: 'short' });
          time = timestamp.toLocaleString('en-us', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
          return [date, time];
        },
      },
    },
    y: {
      display: true,
      grid: {
        zeroLineColor: '#000000',
        lineWidth: 0,
      },
      ticks: {
        beginAtZero: true,
        callback: function (value) {
          if (parseInt(value, 10) >= 1000) {
            return formatWithCurrencyUnit(value);
          }
          return formatWithCurrencyUnit(value);
        },
        font: {
          size: 12,
          family: 'Inter',
          color: 'rgb(134, 147, 157)',
        },
        padding: 15,
      },
      pointLabels: {
        fontFamily: 'Inter',
      },
    },
  },
  plugins: {
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function (context) {
          // Get the dataset label.
          const label = context.dataset.label;
          // Format the y-axis value.
          const labelValue = context.parsed.y;

          const value = formatWithCurrencyUnit(labelValue.toFixed(3));
          return `${label}: ${value}`;
        },
        title: function (tooltipItem, data) {
          const timestamp = new Date(tooltipItem[0]['label']);
          const label = timestamp.toLocaleString('en-us', {
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
          return label;
        },
        afterBody: function () {
          return [];
        },
      },
      titleFontFamily: 'Inter',
      bodyFontFamily: 'Inter',
    },
    legend: {
      labels: {
        font: {
          family: 'Inter',
          color: '#000000',
          weight: 500,
          size: 12,
        },
        color: '#000000',
        padding: 15,
      },
      position: 'bottom',
      display: false,
    },
  },
};

export { anomalyChartOptsConstants };
