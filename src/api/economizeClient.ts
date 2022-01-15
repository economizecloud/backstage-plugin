import { ConfigApi } from '@backstage/core-plugin-api';
import { EconomizeApi, MonthlyCost } from '.';
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from '@aws-sdk/client-cost-explorer';
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
    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: '2021-10-01', End: '2022-01-14' },
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
      monthly.labels = [...monthly.labels, value.TimePeriod?.Start as string];
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
    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: '2021-10-01', End: '2022-01-14' },
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
      monthly.labels = [...monthly.labels, value.TimePeriod?.Start as string];
      monthly.data = [
        ...monthly.data,
        parseFloat(value.Total?.UnblendedCost.Amount as string),
      ];
    });
    return monthly;
  }
  // getWeeklyCost(): string {
  //   return this.configApi.getString('economize.table');
  // }
  // getDailyCost(): string {
  //   return this.configApi.getString('economize.table');
  // }
  // getTopServices(): string {
  //   return this.configApi.getString('economize.table');
  // }
  // getTopTags(): string {
  //   return this.configApi.getString('economize.table');
  // }
}
