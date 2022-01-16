import { useApi } from '@backstage/core-plugin-api';
import { ChartData, ScatterDataPoint } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';
import { formatWithCurrencyUnit } from '../../ulits/ulits';
import BaseLine from '../BaseComponents/BaseLine';

const MonthlyLineChart = () => {
  const MonthlyData = useApi(economizeApiRef);
  const [data, setData] = useState<
    ChartData<'line', (number | ScatterDataPoint | null)[], unknown>
  >({
    labels: [],
    datasets: [],
  });

  const fetchMonthlyData = async () => {
    const monthData = await MonthlyData.getMonthlyCost();
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
    fetchMonthlyData();
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
      title="Monthly"
      data={data}
    />
  );
};

export default MonthlyLineChart;
