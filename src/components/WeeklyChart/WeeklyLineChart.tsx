import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  Card,
  CardHeader,
  Grid,
  Typography,
  Switch,
  CardContent,
  Box,
} from '@material-ui/core';
import { ChartData, ScatterDataPoint } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';
import { ScrollAnchor } from '../../ulits/scroll';
import { formatWithCurrencyUnit } from '../../ulits/ulits';
import BaseLine from '../BaseComponents/BaseLine';

const DailyLineChart = () => {
  const DailyData = useApi(economizeApiRef);
  const [Credit, setCredit] = useState(false);
  const [Loading, setLoading] = useState(false);

  const [data, setData] = useState<
    ChartData<'line', (number | ScatterDataPoint | null)[], unknown>
  >({
    labels: [],
    datasets: [],
  });

  const fetchDailyData = async () => {
    setLoading(true);
    const monthData = await DailyData.getWeeklyCost(Credit);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchDailyData();
  }, [Credit]);

  return (
    <Card style={{ backgroundColor: 'white', color: 'black' }}>
      <ScrollAnchor id="weekly-cost" />
      {Loading && <Progress />}

      <CardHeader
        title="Weekly Cost"
        action={
          <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Typography variant="body2">Show Credit</Typography>
            <Switch
              disabled={Loading}
              checked={Credit}
              onChange={() => setCredit(!Credit)}
            />
          </Grid>
        }
      />
      <CardContent>
        <Box sx={{ height: 500 }}>
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
                    (labelValue === undefined
                      ? 0
                      : parseFloat(labelValue)
                    ).toFixed(2),
                  )
                );
              },
            }}
            isLegend={false}
            title="Weekly"
            data={
              !Loading
                ? data
                : {
                    labels: [],
                    datasets: [],
                  }
            }
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DailyLineChart;
