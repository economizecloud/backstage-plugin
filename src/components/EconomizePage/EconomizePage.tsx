import React from 'react';
import { Box, Grid } from '@material-ui/core';
import { Page, Content } from '@backstage/core-components';
import { MonthlyLineChart, ServiceMonthlyBarChart } from '../MonthlyChart';
import { DailyLineChart } from '../DailyChart';
import { WeeklyLineChart } from '../WeeklyChart';
import Menu from '../Menu';
import HeaderBanner from './HeaderBanner';
import { AnomalyDetection } from '../AnomalyDetection';

export const EconomizePage = () => {
  return (
    <Page themeId="service">
      <HeaderBanner />
      <div style={{ backgroundColor: 'whitesmoke', color: 'black' }}>
        <Content>
          <Grid container direction="row" spacing={5}>
            <Grid item md={2}>
              <Box position="sticky" top={20}>
                <Menu />
              </Box>
            </Grid>
            <Grid item md={10}>
              <Grid container direction="column">
                <Grid item>
                  <DailyLineChart />
                </Grid>
                <Grid item>
                  <WeeklyLineChart />
                </Grid>
                <Grid item>
                  <MonthlyLineChart />
                </Grid>
                <Grid item>
                  <ServiceMonthlyBarChart />
                </Grid>
                <Grid item>
                  <AnomalyDetection />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Content>
      </div>
    </Page>
  );
};
