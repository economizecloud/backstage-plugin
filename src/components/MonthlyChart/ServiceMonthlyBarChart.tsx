import { useApi } from '@backstage/core-plugin-api';
import {
  Box,
  CircularProgress,
  Grid,
  makeStyles,
  styled,
  Switch,
  Typography,
} from '@material-ui/core';
import { ChartData, ChartDataset, ScatterDataPoint } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';
import { formatWithCurrencyUnit } from '../../ulits/ulits';
import BaseBar from '../BaseComponents/BaseBar';
function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
const ServiceMonthlyBarChart = () => {
  const MonthlyData = useApi(economizeApiRef);
  const [data, setData] = useState<
    ChartData<'bar', (number | ScatterDataPoint | null)[], unknown>
  >({
    labels: [],
    datasets: [],
  });
  const [Credit, setCredit] = useState(false);
  const [Loading, setLoading] = useState(false);

  const fetchMonthlyData = async () => {
    setLoading(true);
    let dataset: ChartDataset<'bar', (number | ScatterDataPoint | null)[]>[] =
      [];
    const label: string[] = [];
    const monthData = await MonthlyData.getTopServices(Credit);
    const isLabelExist: { [key: string]: boolean } = {};
    const isDatasetExist: { [key: string]: number } = {};
    let count = 0;

    monthData.forEach(arr => {
      if (!isLabelExist[arr.month]) {
        isLabelExist[arr.month] = true;
        label.push(arr.month);
      }

      if (isDatasetExist[arr.service]) {
        dataset[isDatasetExist[arr.service]].data.push(arr.amount);
      } else {
        const color = getRandomColor();
        isDatasetExist[arr.service] = count;
        dataset.push({
          data: [arr.amount],
          label: arr.name,
          backgroundColor: color,
          borderColor: color,
        });
        count++;
      }
    });

    dataset = dataset
      .sort(function (a, b) {
        const bdata = b.data.reduce((a, b) => parseFloat(a) + parseFloat(b));
        const adata = a.data.reduce((a, b) => parseFloat(a) + parseFloat(b));
        return bdata - adata;
      })
      .slice(0, 5);
    setData({
      labels: label,
      datasets: dataset,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [Credit]);

  return (
    <div>
      {Loading ? (
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Typography variant="body2">Show Credit</Typography>
            <Switch checked={Credit} onChange={() => setCredit(!Credit)} />
          </Grid>
          <Box sx={{ height: 500 }}>
            <BaseBar
              yAxesCallbackFunc={label => {
                const formattedValue = formatWithCurrencyUnit(
                  (label === undefined ? 0 : parseFloat(label)).toFixed(2),
                );
                return formattedValue;
              }}
              tooltipCallbackFunc={{
                label: function (context) {
                  const label = context.dataset.label;

                  const labelValue = context.parsed.y;
                  return (
                    label +
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
              isLegend
              title="Top Service"
              data={data}
            />
          </Box>
        </>
      )}
    </div>
  );
};

export default ServiceMonthlyBarChart;
