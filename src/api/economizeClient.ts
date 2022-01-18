import { ConfigApi } from '@backstage/core-plugin-api';
import { EconomizeApi, MonthlyCost, OrgName, ServiceCost, WeeklyCost } from '.';
import { subYears, subMonths, format } from 'date-fns';
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
} from '@aws-sdk/client-cost-explorer';
import {
  OrganizationsClient,
  ListRootsCommand,
  ListOrganizationalUnitsForParentCommand,
  DescribeOrganizationCommand,
} from '@aws-sdk/client-organizations';
import { GetQuery } from './GetQuery';
import { fetchQuery, getWeekRange } from '../ulits/ulits';
import axios from 'axios';
type Options = {
  configApi: ConfigApi;
};
export class EconomomizeClient implements EconomizeApi {
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
  }

  async getOrgAndProject(): Promise<OrgName> {
    const client = new OrganizationsClient({
      region: this.configApi.getString('economize.region'),
      credentials: {
        accessKeyId: this.configApi.getString('economize.accessKeyId'),
        secretAccessKey: this.configApi.getString('economize.secretAccessKey'),
      },
    });
    const orgdes = new DescribeOrganizationCommand({});
    const orgdesRes = await client.send(orgdes);

    const acc = new ListRootsCommand({});
    const data1 = await client.send(acc);
    const org = new ListOrganizationalUnitsForParentCommand({
      ParentId: data1.Roots[0].Id,
    });
    const data2 = await client.send(org);
    return {
      name: data2.OrganizationalUnits[0].Name,
      OrgID: orgdesRes.Organization.Id,
      AccID: orgdesRes.Organization.MasterAccountId,
    };
  }

  async getMonthlyCost(isCredit: boolean): Promise<MonthlyCost> {
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

    let optionsCommand: GetCostAndUsageCommandInput = {
      TimePeriod: { Start: lastYear, End: firstYear },
      Metrics: ['UNBLENDED_COST'],
      Granularity: 'MONTHLY',
    };

    if (isCredit) {
      optionsCommand = {
        ...optionsCommand,
        Filter: {
          Dimensions: {
            Key: 'RECORD_TYPE',
            Values: ['Credit'],
          },
        },
      };
    }

    const command = new GetCostAndUsageCommand(optionsCommand);

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
  async getDailyCost(isCredit: boolean): Promise<MonthlyCost> {
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

    let optionsCommand: GetCostAndUsageCommandInput = {
      TimePeriod: { Start: lastYear, End: firstYear },
      Metrics: ['UNBLENDED_COST'],
      Granularity: 'DAILY',
    };

    if (isCredit) {
      optionsCommand = {
        ...optionsCommand,
        Filter: {
          Dimensions: {
            Key: 'RECORD_TYPE',
            Values: ['Credit'],
          },
        },
      };
    }

    const command = new GetCostAndUsageCommand(optionsCommand);

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
  async getWeeklyCost(isCredit: boolean): Promise<WeeklyCost> {
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
        isCredit,
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

  async getAnomalyDelection(
    startDate: string,
    endDate: string,
  ): Promise<string> {
    const data = await axios.post(
      'https://localhost:8443/public/aws/anomaly_detection',
      {
        endDate: '2022-01-18 14:40:00-07',
        startDate: '2022-01-10 14:40:00-07',
        type: 'Prophet',
      },
    );
    return;
  }
}
