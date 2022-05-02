import { useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Switch,
  Typography,
} from '@material-ui/core';
import { ChartData, ChartDataset, ScatterDataPoint } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';
import { ScrollAnchor } from '../../utils/scroll';
import { formatWithCurrencyUnit } from '../../utils/utils';
import BaseBar from '../BaseComponents/BaseBar';

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
        isDatasetExist[arr.service] = count;
        dataset.push({
          data: [arr.amount],
          label: arr.name,
        });
        count++;
      }
    });

    dataset = dataset
      .sort(function (a, b) {
        const bdata: any = b.data.reduce(
          (a: any, b: any) => parseFloat(a) + parseFloat(b),
        );
        const adata: any = a.data.reduce(
          (a: any, b: any) => parseFloat(a) + parseFloat(b),
        );
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
    <Card style={{ backgroundColor: 'white', color: 'black' }}>
      <ScrollAnchor id="top-components" />
      <CardHeader
        title="Top Components"
        action={
          <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Typography variant="body2">Show Credits</Typography>
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
              <Box sx={{ height: 500 }}>
                <BaseBar
                  yAxesCallbackFunc={(label: any) => {
                    const formattedValue = formatWithCurrencyUnit(
                      (label === undefined ? 0 : parseFloat(label)).toFixed(2),
                    );
                    return formattedValue;
                  }}
                  tooltipCallbackFunc={{
                    label: function (context: any) {
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
            )}
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ServiceMonthlyBarChart;
