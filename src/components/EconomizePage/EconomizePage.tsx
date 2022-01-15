import React from 'react';
import { Grid } from '@material-ui/core';
import { Header, Page, Content } from '@backstage/core-components';
import { MonthlyLineChart } from '../MonthlyChart';
import { DailyLineChart } from '../DailyChart';

export const EconomizePage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Economize Cloud"
        subtitle="Your cloud infrastructure costs, demystified"
      ></Header>
      <Content>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <MonthlyLineChart />
            <DailyLineChart />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
