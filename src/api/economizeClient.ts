import { ConfigApi } from '@backstage/core-plugin-api';
import { EconomizeApi, MonthlyCost, ServiceCost, WeeklyCost } from '.';
import { subYears, subMonths, format } from 'date-fns';
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from '@aws-sdk/client-cost-explorer';

import { GetQuery } from './GetQuery';
import { fetchQuery, getWeekRange } from '../ulits/ulits';
type Options = {
  configApi: ConfigApi;
};
export class EconomomizeClient implements EconomizeApi {
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
  }

  async getMonthlyCost(): Promise<MonthlyCost> {
    const monthly: MonthlyCost = {
      labels: [],
      data: [],
    };
    const client = new CostExplorerClient({
      region: this.configApi.getString('economize.region'),
      credentials: {
        accessKeyId: this.configApi.getString('economize.accessKeyId'),
        secretAccessKey: this.configApi.getString('economize.secretAccessKey'),
      },
    });

    let lastYear = format(subYears(new Date(), 1), 'yyyy-MM-dd');
    let firstYear = format(new Date(), 'yyyy-MM-dd');

    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: lastYear, End: firstYear },
      Filter: {
        Dimensions: {
          Key: 'RECORD_TYPE',
          Values: ['Credit'],
        },
      },
      Metrics: ['UNBLENDED_COST'],
      Granularity: 'MONTHLY',
    });

    const data = await client.send(command);

    data.ResultsByTime?.map(value => {
      monthly.labels = [
        ...monthly.labels,
        format(new Date(value.TimePeriod?.Start as string), 'LLL'),
      ];
      monthly.data = [
        ...monthly.data,
        parseFloat(value.Total?.UnblendedCost.Amount as string),
      ];
    });
    return monthly;
  }
  async getDailyCost(): Promise<MonthlyCost> {
    const monthly: MonthlyCost = {
      labels: [],
      data: [],
    };
    const client = new CostExplorerClient({
      region: this.configApi.getString('economize.region'),
      credentials: {
        accessKeyId: this.configApi.getString('economize.accessKeyId'),
        secretAccessKey: this.configApi.getString('economize.secretAccessKey'),
      },
    });

    let lastYear = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
    let firstYear = format(new Date(), 'yyyy-MM-dd');

    console.log({ firstYear, lastYear });
    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: lastYear, End: firstYear },
      Filter: {
        Dimensions: {
          Key: 'RECORD_TYPE',
          Values: ['Credit'],
        },
      },
      Metrics: ['UNBLENDED_COST'],
      Granularity: 'DAILY',
    });

    const data = await client.send(command);

    data.ResultsByTime?.map(value => {
      monthly.labels = [
        ...monthly.labels,
        format(new Date(value.TimePeriod?.Start as string), 'dd LLL'),
      ];
      monthly.data = [
        ...monthly.data,
        parseFloat(value.Total?.UnblendedCost.Amount as string),
      ];
    });
    return monthly;
  }
  async getWeeklyCost(): Promise<WeeklyCost> {
    const monthly: WeeklyCost = {
      labels: [],
      data: [],
    };

    const fetchResultData = await fetchQuery(
      this.configApi,
      GetQuery.weeklyCost(
        this.configApi.getString('economize.table'),
        this.configApi.getString('economize.database'),
        format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      ),
    );

    fetchResultData.ResultSet?.Rows?.slice(1).forEach(arr => {
      monthly.labels = [
        ...monthly.labels,
        [
          `Week ${arr.Data ? arr.Data[0].VarCharValue?.slice(-2) : ''}`,
          getWeekRange(
            parseInt(
              arr.Data ? (arr.Data[0].VarCharValue?.slice(-2) as string) : '',
            ),
            parseInt(
              arr.Data ? (arr.Data[0].VarCharValue?.slice(0, 3) as string) : '',
            ),
          ) as string,
        ],
      ];
      monthly.data = [
        ...monthly.data,
        parseFloat(arr.Data ? (arr.Data[1].VarCharValue as string) : ''),
      ];
    });

    return monthly;
  }
  async getTopServices(isCredit: boolean): Promise<ServiceCost[]> {
    const topService: ServiceCost[] = [];
    const fetchResultData = await fetchQuery(
      this.configApi,
      GetQuery.top10Services(
        this.configApi.getString('economize.table'),
        this.configApi.getString('economize.database'),
        format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
        isCredit,
      ),
    );

    fetchResultData.ResultSet?.Rows?.slice(1).forEach(arr => {
      topService.push({
        service: arr.Data ? (arr.Data[0].VarCharValue as string) : '',
        month: format(
          new Date(arr.Data ? (arr.Data[1].VarCharValue as string) : ''),
          'LLL',
        ),
        amount: parseFloat(
          arr.Data ? (arr.Data[2].VarCharValue as string) : '',
        ),
        name: arr.Data ? (arr.Data[3].VarCharValue as string) : '',
      });
    });

    return topService;
  }

  // getTopTags(): string {
  //   return this.configApi.getString('economize.table');
  // }
}
