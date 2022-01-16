import React from 'react';
import { Box, Grid } from '@material-ui/core';
import { Header, Page, Content } from '@backstage/core-components';
import { MonthlyLineChart, ServiceMonthlyBarChart } from '../MonthlyChart';
import { DailyLineChart } from '../DailyChart';
import { WeeklyLineChart } from '../WeeklyChart';

export const EconomizePage = () => {
  return (
    <Page themeId="service">
      <Header
        title="Economize Cloud"
        subtitle="Your cloud infrastructure costs, demystified"
      ></Header>
      <Content>
        <Grid container>
          <Grid item md={6}>
            <MonthlyLineChart />
          </Grid>
          <Grid item md={6}>
            <ServiceMonthlyBarChart />
          </Grid>
          <Grid item md={6}>
            <Box sx={{ height: 500 }}>
              <DailyLineChart />
            </Box>
          </Grid>
          <Grid item md={6}>
            <Box sx={{ height: 500 }}>
              <WeeklyLineChart />
            </Box>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
