import { Progress, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  MenuItem,
  Select,
} from '@material-ui/core';
import { ChartData, ScatterDataPoint } from 'chart.js';
import { subDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { economizeApiRef } from '../../api';
import { ErrorMessageMap } from '../../utils/error';
import { ScrollAnchor } from '../../utils/scroll';
import { formatWithCurrencyUnit } from '../../utils/utils';
import { anomalyChartOptsConstants } from './anomalyChartConstants';

const DailyLineChart = () => {
  const DailyData = useApi(economizeApiRef);
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState<'WEEKLY' | 'MONTHLY' | '14DAYS'>('WEEKLY');

  const daysMenu = [
    {
      name: 'Weekly',
      value: 'WEEKLY',
    },
    {
      name: 'Monthly',
      value: 'MONTHLY',
    },
    {
      name: '14 Days',
      value: '14DAYS',
    },
  ];

  const [data, setData] = useState<
    ChartData<'line', (number | ScatterDataPoint | null)[], unknown>
  >({
    labels: [],
    datasets: [],
  });
  const [Options, setOptions] = useState<any>(anomalyChartOptsConstants);

  const boundColor = (ctx: any, color: any) => {
    return color[ctx.p0DataIndex];
  };

  const dateCondition = {
    WEEKLY: {
      StartDate: subDays(new Date(), 7),
      EndDate: new Date(),
    },
    MONTHLY: {
      StartDate: subDays(new Date(), 31),
      EndDate: new Date(),
    },
    '14DAYS': {
      StartDate: subDays(new Date(), 14),
      EndDate: new Date(),
    },
  };

  const fetchDailyData = async () => {
    setLoading(true);
    try {
      const anomalyChartOpts: any = anomalyChartOptsConstants;
      const anomalyIndexMap: any = {};

      const anomalyData = await DailyData.getAnomalyDelection(
        dateCondition[date].StartDate,
        dateCondition[date].EndDate,
      );

      if (!anomalyData.anomalies) {
        setLoading(false);
        return;
      }
      anomalyData.bounds.sort(function (x, y) {
        const firstDate = Date.parse(x.anomalyTimestampISO);
        const secondDate = Date.parse(y.anomalyTimestampISO);
        return firstDate - secondDate;
      });

      let projectLevelLineColor: any[] = [];
      let chartData: any = {
        type: 'line',
        labels: [],
        labelTimestamps: [],
        datasets: [
          {
            data: [],
            label: 'Actual Costs',
            borderColor: 'rgba(27,175,252,1)',
            fill: false,
            pointHoverRadius: 10,
            segment: {
              borderColor: (ctx: any) => {
                return boundColor(ctx, projectLevelLineColor);
              },
            },
          },
          {
            data: [],
            label: 'Upper Bound',
            backgroundColor: 'rgba(27,175,252, 0.1)',
            borderColor: 'rgba(27,175,252, 0.3)',
            fill: '+1',
          },
          {
            data: [],
            label: 'Lower Bound',
            backgroundColor: 'rgba(27,175,2529, 0.1)',
            borderColor: 'rgba(27,175,252,0.3)',
            fill: '-1',
          },
        ],
      };

      chartData.datasets[0].data = anomalyData.bounds.map(b => b.actual_cost);
      anomalyData.bounds.forEach(b => {
        if (b.label === '2') {
          projectLevelLineColor.push('rgb(252, 152, 3)');
        } else {
          projectLevelLineColor.push('rgb(27, 175, 252)');
        }
      });
      chartData.datasets[2].data = anomalyData.bounds.map(b =>
        b.expected_cost_range[0] < 0 ? 0 : b.expected_cost_range[0],
      );
      chartData.datasets[1].data = anomalyData.bounds.map(
        b => b.expected_cost_range[1],
      );
      chartData.labels = anomalyData.bounds.map(b => b.anomalyTimestampISO);
      chartData.labelTimestamps = anomalyData.bounds.map(
        b => b.anomalyTimestamp,
      );

      anomalyData.bounds.forEach((bound, index) => {
        if (
          anomalyData.anomalies.some(
            anomaly =>
              anomaly.anomalyTimestampISO === bound.anomalyTimestampISO,
          )
        ) {
          anomalyIndexMap[index] = bound.anomalyTimestampISO;
        }
      });
      anomalyChartOpts.elements.point['radius'] = (context: any) => {
        if (context.dataset.label !== 'Actual Costs') {
          return 0;
        }
        let index = context.dataIndex;
        return index in anomalyIndexMap ? 8 : 0;
      };
      anomalyChartOpts.plugins.tooltip['callbacks']['label'] = (
        context: any,
      ) => {
        // Get the dataset label.
        const label = context.dataset.label;
        // Format the y-axis value.
        const labelValue = context.parsed.y;
        const value = formatWithCurrencyUnit(labelValue.toFixed(3));
        if (`${label}` === 'Actual Costs') {
          return `${label}:${value}`;
        }
        return '';
      };

      setData(chartData);
      setOptions(anomalyChartOpts);
      // this.currentWeekAnomalyCost = formatWithCurrencyUnit(
      //   `${anomalyData.total_anomaly_cost}`,
      // );
    } catch (err: any) {
      if (err?.response) {
        setError(
          ErrorMessageMap[err?.response?.data?.error?.message] ??
            ErrorMessageMap['BACKSTAGE/SOMETHING_WRONG'],
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
  }, [date]);

  return (
    <Card style={{ backgroundColor: 'white', color: 'black' }}>
      <ScrollAnchor id="anomalies" />

      {error && (
        <WarningPanel
          title={error}
          severity={
            error.includes('Unavailable') || error.includes('Something')
              ? 'error'
              : 'warning'
          }
        />
      )}
      {Loading && <Progress />}
      <CardHeader
        title="Anomalies Cost"
        action={
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={date}
            label="Age"
            onChange={e => setDate(e.target.value as typeof date)}
          >
            {daysMenu.map(arr => (
              <MenuItem value={arr.value}> {arr.name}</MenuItem>
            ))}
          </Select>
        }
      />
      <CardContent>
        <Box sx={{ height: 500 }}>
          <Line options={Options} data={data} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DailyLineChart;
