import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { Header, Page, Content, HeaderLabel } from '@backstage/core-components';
import { MonthlyLineChart, ServiceMonthlyBarChart } from '../MonthlyChart';
import { DailyLineChart } from '../DailyChart';
import { WeeklyLineChart } from '../WeeklyChart';
import Menu from '../Menu';
import { useApi } from '@backstage/core-plugin-api';
import { economizeApiRef } from '../../api';
import HeaderBanner from './HeaderBanner';

export const EconomizePage = () => {
  return (
    <Page themeId="service">
      <HeaderBanner />
      <Content style={{ backgroundColor: 'whitesmoke', color: 'black' }}>
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
            </Grid>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
