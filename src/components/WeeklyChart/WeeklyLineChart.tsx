import { useApi } from '@backstage/core-plugin-api';
import { ChartData, ScatterDataPoint } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';
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

  return <BaseLine isLegend={false} title="Weekly" data={data} />;
};

export default DailyLineChart;
