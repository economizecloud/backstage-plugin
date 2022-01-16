import { useApi } from '@backstage/core-plugin-api';
import { ChartData, ScatterDataPoint } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';
import { formatWithCurrencyUnit } from '../../ulits/ulits';
import BaseLine from '../BaseComponents/BaseLine';

const DailyLineChart = () => {
  const DailyData = useApi(economizeApiRef);
  const [data, setData] = useState<
    ChartData<'line', (number | ScatterDataPoint | null)[], unknown>
  >({
    labels: [],
    datasets: [],
  });

  const fetchDailyData = async () => {
    const monthData = await DailyData.getWeeklyCost();
    console.log({ monthData });
    setData({
      labels: monthData.labels,
      datasets: [
        {
          data: monthData.data,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    });
  };

  useEffect(() => {
    fetchDailyData();
  }, []);

  return (
    <BaseLine
      yAxesCallbackFunc={label => {
        const formattedValue = formatWithCurrencyUnit(
          (label === undefined ? 0 : parseFloat(label)).toFixed(2),
        );
        return formattedValue;
      }}
      tooltipCallbackFunc={{
        label: function (context) {
          const labelValue = context.parsed.y;
          return (
            ': ' +
            formatWithCurrencyUnit(
              (labelValue === undefined ? 0 : parseFloat(labelValue)).toFixed(
                2,
              ),
            )
          );
        },
      }}
      isLegend={false}
      title="Weekly"
      data={data}
    />
  );
};

export default DailyLineChart;
