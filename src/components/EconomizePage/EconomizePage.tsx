import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@material-ui/core';
import { Header, Page, Content } from '@backstage/core-components';
import { MonthlyLineChart, ServiceMonthlyBarChart } from '../MonthlyChart';
import { DailyLineChart } from '../DailyChart';
import { WeeklyLineChart } from '../WeeklyChart';
import Menu from '../Menu';
import { Element } from 'react-scroll';
import { ScrollAnchor } from '../../ulits/scroll';

export const EconomizePage = () => {
  const cardstyle = { backgroundColor: 'white', color: 'black' };
  return (
    <Page themeId="service">
      <Header
        title="Economize Cloud"
        subtitle="Your cloud infrastructure costs, demystified"
      ></Header>
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
                <Card style={cardstyle}>
                  <ScrollAnchor id="daily-cost" />
                  <CardHeader title="Daily Cost" />
                  <CardContent>
                    <Box sx={{ height: 500 }}>
                      <DailyLineChart />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card style={cardstyle}>
                  <ScrollAnchor id="weekly-cost" />
                  <CardHeader title="Weekly Cost" />
                  <CardContent>
                    <Box sx={{ height: 500 }}>
                      <WeeklyLineChart />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card style={cardstyle}>
                  <ScrollAnchor id="monthly-cost" />

                  <CardHeader title="Monthly Cost" />
                  <CardContent>
                    <Box sx={{ height: 500 }}>
                      <MonthlyLineChart />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card style={cardstyle}>
                  <ScrollAnchor id="top-components" />

                  <CardHeader title="Top Components" />
                  <CardContent>
                    <Box sx={{ height: 600 }}>
                      <ServiceMonthlyBarChart />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
