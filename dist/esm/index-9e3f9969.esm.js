import { createApiRef, createRouteRef, createPlugin, createApiFactory, configApiRef, createRoutableExtension } from '@backstage/core-plugin-api';
import { format, subYears, subMonths } from 'date-fns';
import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';
import { OrganizationsClient, DescribeOrganizationCommand, ListRootsCommand, ListOrganizationalUnitsForParentCommand } from '@aws-sdk/client-organizations';
import { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } from '@aws-sdk/client-athena';
import axios from 'axios';

const economizeApiRef = createApiRef({
  id: "plugin.economize.service"
});

const GetQuery = {
  weeklyCost(table, database, start_date, isCredit) {
    return `
    SELECT (YEAR(line_item_usage_start_date) * 100) + WEEK(line_item_usage_start_date) as Week,
	  sum(line_item_unblended_cost) as cost
    FROM "${database}"."${table}"
    WHERE 
    ${isCredit ? `line_item_line_item_type = 'Credit' AND` : ``}
	   line_item_usage_start_date > DATE('${start_date}')
    group by 1
    order by 1;
    `;
  },
  top10Services(table, database, start_date, isCredit) {
    return `
  select "line_item_product_code",
	date(bill_billing_period_start_date),
	round(sum("line_item_unblended_cost"), 2) as cost,
  product_product_name
  from "${database}"."${table}"
  where
  ${isCredit ? ` line_item_line_item_type = 'Credit' AND` : ``}
	 bill_billing_period_start_date > Date('${start_date}')
  group by 1,2,4
  order by 2;
    `;
  }
};

const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const getWeekRange = (weekNo, yearNo) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  let firstDayofYear = new Date(yearNo, 0, 1);
  if (firstDayofYear.getDay() > 4) {
    let weekStart = new Date(yearNo, 0, 1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 7);
    let weekEnd = new Date(yearNo, 0, 1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 7 + 6);
    return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]}`;
  } else {
    let weekStart = new Date(yearNo, 0, 1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 1);
    let weekEnd = new Date(yearNo, 0, 1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 1 + 5);
    return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]}`;
  }
};
const fetchQuery = async (configApi, QueryString) => {
  const athenaClient = new AthenaClient({
    region: configApi.getString("economize.region"),
    credentials: {
      accessKeyId: configApi.getString("economize.accessKeyId"),
      secretAccessKey: configApi.getString("economize.secretAccessKey")
    }
  });
  const fetchWeeklyCost = new StartQueryExecutionCommand({
    QueryString,
    WorkGroup: configApi.getString("economize.workGroup"),
    ResultConfiguration: {
      OutputLocation: configApi.getString("economize.outputLocation")
    }
  });
  const response = await athenaClient.send(fetchWeeklyCost);
  const getQueryExecution = new GetQueryExecutionCommand({
    QueryExecutionId: response.QueryExecutionId
  });
  let retries = 0;
  let retry = true;
  do {
    await waitFor(2 ** retries * 100);
    const getResultRes = await athenaClient.send(getQueryExecution);
    const Status = getResultRes.QueryExecution.Status.State;
    if (Status === "SUCCEEDED") {
      retry = false;
    } else if (["RUNNING", "QUEUED"].includes(Status)) {
      retry = true;
    } else {
      retry = false;
    }
    retries++;
  } while (retry && retries < 5);
  const getResultQuery = new GetQueryResultsCommand({
    QueryExecutionId: response.QueryExecutionId
  });
  const fetchResultData = await athenaClient.send(getResultQuery);
  return fetchResultData;
};
const color = [
  "rgb(27, 175, 252)",
  "rgb(161, 222, 254)",
  "rgb(40, 79, 147)",
  "rgb(39, 127, 254)",
  "rgb(107, 97, 243)",
  "rgb(65, 54, 219)",
  "rgb(53, 44, 186)",
  "rgb(88, 77, 236)",
  "rgb(107, 97, 243)",
  "rgb(136, 120, 252)"
];
const formatWithCurrencyUnit = (cost, code = "USD") => {
  if (!(code in currencyCodeSymbolMap)) {
    return numberWithCommas(cost).toString() + " " + code;
  }
  const symbol = currencyCodeSymbolMap[code];
  return symbol + " " + getNumberUnit(cost);
};
const numberWithCommas = (x) => {
  return round2Places(parseFloat(x)).toLocaleString("en-US");
};
const round2Places = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
function getNumberUnit(labelValue) {
  const sign = Math.sign(Number(labelValue));
  return Number(labelValue) >= 1e9 ? sign * (Number(labelValue) / 1e9).toFixed(2) + "B" : Number(labelValue) >= 1e6 ? sign * (Number(labelValue) / 1e6).toFixed(2) + "M" : Number(labelValue) >= 1e3 ? sign * (Number(labelValue) / 1e3).toFixed(2) + "K" : Number(labelValue) === 0 ? sign * Number(labelValue) : Number(labelValue).toFixed(2);
}
const currencyCodes = [
  {
    code: "USD",
    symbol: "$"
  },
  {
    code: "EUR",
    symbol: "\u20AC"
  },
  {
    code: "INR",
    symbol: "\u20B9"
  },
  {
    code: "AUD",
    symbol: ""
  },
  {
    code: "NOK",
    symbol: ""
  },
  {
    code: "BRL",
    symbol: ""
  },
  {
    code: "CAD",
    symbol: ""
  },
  {
    code: "CZK",
    symbol: ""
  },
  {
    code: "DKK",
    symbol: ""
  },
  {
    code: "HKD",
    symbol: ""
  },
  {
    code: "IDR",
    symbol: "Rp"
  },
  {
    code: "ILS",
    symbol: ""
  },
  {
    code: "JPY",
    symbol: ""
  },
  {
    code: "CHF",
    symbol: ""
  },
  {
    code: "MYR",
    symbol: ""
  },
  {
    code: "MXN",
    symbol: ""
  },
  {
    code: "NZD",
    symbol: ""
  },
  {
    code: "PLN",
    symbol: ""
  },
  {
    code: "RUB",
    symbol: ""
  },
  {
    code: "SGD",
    symbol: ""
  },
  {
    code: "KRW",
    symbol: ""
  },
  {
    code: "SEK",
    symbol: ""
  },
  {
    code: "TWD",
    symbol: ""
  },
  {
    code: "THB",
    symbol: ""
  },
  {
    code: "TRY",
    symbol: ""
  },
  {
    code: "GBP",
    symbol: ""
  },
  {
    code: "VND",
    symbol: ""
  }
];
const currencyCodeSymbolMap = currencyCodes.reduce((map, obj) => {
  map[obj.code] = obj.symbol;
  return map;
}, {});

class EconomomizeClient {
  constructor(options) {
    this.configApi = options.configApi;
  }
  async getOrgAndProject() {
    const client = new OrganizationsClient({
      region: this.configApi.getString("economize.region"),
      credentials: {
        accessKeyId: this.configApi.getString("economize.accessKeyId"),
        secretAccessKey: this.configApi.getString("economize.secretAccessKey")
      }
    });
    try {
      const orgdes = new DescribeOrganizationCommand({});
      const orgdesRes = await client.send(orgdes);
      const acc = new ListRootsCommand({});
      const data1 = await client.send(acc);
      const org = new ListOrganizationalUnitsForParentCommand({
        ParentId: data1.Roots[0].Id
      });
      const data2 = await client.send(org);
      return {
        name: data2.OrganizationalUnits[0].Name,
        OrgID: orgdesRes.Organization.Id,
        AccID: orgdesRes.Organization.MasterAccountId
      };
    } catch {
      return {
        name: "",
        OrgID: "",
        AccID: ""
      };
    }
  }
  async getMonthlyCost(isCredit) {
    var _a;
    const monthly = {
      labels: [],
      data: []
    };
    const client = new CostExplorerClient({
      region: this.configApi.getString("economize.region"),
      credentials: {
        accessKeyId: this.configApi.getString("economize.accessKeyId"),
        secretAccessKey: this.configApi.getString("economize.secretAccessKey")
      }
    });
    let lastYear = format(subYears(new Date(), 1), "yyyy-MM-dd");
    let firstYear = format(new Date(), "yyyy-MM-dd");
    let optionsCommand = {
      TimePeriod: { Start: lastYear, End: firstYear },
      Metrics: ["UNBLENDED_COST"],
      Granularity: "MONTHLY"
    };
    if (isCredit) {
      optionsCommand = {
        ...optionsCommand,
        Filter: {
          Dimensions: {
            Key: "RECORD_TYPE",
            Values: ["Credit"]
          }
        }
      };
    }
    const command = new GetCostAndUsageCommand(optionsCommand);
    const data = await client.send(command);
    (_a = data.ResultsByTime) == null ? void 0 : _a.map((value) => {
      var _a2, _b;
      monthly.labels = [
        ...monthly.labels,
        format(new Date((_a2 = value.TimePeriod) == null ? void 0 : _a2.Start), "LLL")
      ];
      monthly.data = [
        ...monthly.data,
        parseFloat((_b = value.Total) == null ? void 0 : _b.UnblendedCost.Amount)
      ];
    });
    return monthly;
  }
  async getDailyCost(isCredit) {
    var _a;
    const monthly = {
      labels: [],
      data: []
    };
    const client = new CostExplorerClient({
      region: this.configApi.getString("economize.region"),
      credentials: {
        accessKeyId: this.configApi.getString("economize.accessKeyId"),
        secretAccessKey: this.configApi.getString("economize.secretAccessKey")
      }
    });
    let lastYear = format(subMonths(new Date(), 1), "yyyy-MM-dd");
    let firstYear = format(new Date(), "yyyy-MM-dd");
    let optionsCommand = {
      TimePeriod: { Start: lastYear, End: firstYear },
      Metrics: ["UNBLENDED_COST"],
      Granularity: "DAILY"
    };
    if (isCredit) {
      optionsCommand = {
        ...optionsCommand,
        Filter: {
          Dimensions: {
            Key: "RECORD_TYPE",
            Values: ["Credit"]
          }
        }
      };
    }
    const command = new GetCostAndUsageCommand(optionsCommand);
    const data = await client.send(command);
    (_a = data.ResultsByTime) == null ? void 0 : _a.map((value) => {
      var _a2, _b;
      monthly.labels = [
        ...monthly.labels,
        format(new Date((_a2 = value.TimePeriod) == null ? void 0 : _a2.Start), "dd LLL")
      ];
      monthly.data = [
        ...monthly.data,
        parseFloat((_b = value.Total) == null ? void 0 : _b.UnblendedCost.Amount)
      ];
    });
    return monthly;
  }
  async getWeeklyCost(isCredit) {
    var _a, _b;
    const monthly = {
      labels: [],
      data: []
    };
    const fetchResultData = await fetchQuery(this.configApi, GetQuery.weeklyCost(this.configApi.getString("economize.table"), this.configApi.getString("economize.database"), format(subMonths(new Date(), 1), "yyyy-MM-dd"), isCredit));
    (_b = (_a = fetchResultData.ResultSet) == null ? void 0 : _a.Rows) == null ? void 0 : _b.slice(1).forEach((arr) => {
      var _a2, _b2, _c;
      monthly.labels = [
        ...monthly.labels,
        [
          `Week ${arr.Data ? (_a2 = arr.Data[0].VarCharValue) == null ? void 0 : _a2.slice(-2) : ""}`,
          getWeekRange(parseInt(arr.Data ? (_b2 = arr.Data[0].VarCharValue) == null ? void 0 : _b2.slice(-2) : ""), parseInt(arr.Data ? (_c = arr.Data[0].VarCharValue) == null ? void 0 : _c.slice(0, 3) : ""))
        ]
      ];
      monthly.data = [
        ...monthly.data,
        parseFloat(arr.Data ? arr.Data[1].VarCharValue : "")
      ];
    });
    return monthly;
  }
  async getTopServices(isCredit) {
    var _a, _b;
    const topService = [];
    const fetchResultData = await fetchQuery(this.configApi, GetQuery.top10Services(this.configApi.getString("economize.table"), this.configApi.getString("economize.database"), format(subMonths(new Date(), 6), "yyyy-MM-dd"), isCredit));
    (_b = (_a = fetchResultData.ResultSet) == null ? void 0 : _a.Rows) == null ? void 0 : _b.slice(1).forEach((arr) => {
      topService.push({
        service: arr.Data ? arr.Data[0].VarCharValue : "",
        month: format(new Date(arr.Data ? arr.Data[1].VarCharValue : ""), "LLL"),
        amount: parseFloat(arr.Data ? arr.Data[2].VarCharValue : ""),
        name: arr.Data ? arr.Data[3].VarCharValue : ""
      });
    });
    return topService;
  }
  async getAnomalyDelection(startDate, endDate) {
    const data = await axios.post("https://app.economize.cloud/api/public/aws/anomaly_detection", {
      endDate: endDate.toISOString().slice(0, -5).replace("T", " ") + "-07",
      startDate: startDate.toISOString().slice(0, -5).replace("T", " ") + "-07",
      type: "Prophet",
      region: this.configApi.getString("economize.region"),
      OrgID: (await this.getOrgAndProject()).OrgID,
      table: this.configApi.getString("economize.table"),
      database: this.configApi.getString("economize.database"),
      workGroup: this.configApi.getString("economize.workGroup"),
      outputLocation: this.configApi.getString("economize.outputLocation"),
      access_token: this.configApi.getString("economize.accessKeyId"),
      access_sercet: this.configApi.getString("economize.secretAccessKey"),
      api_key: this.configApi.getOptionalString("economize.apiKey"),
      hostname: this.configApi.getOptionalString("economize.hostname")
    });
    return data.data;
  }
}

const rootRouteRef = createRouteRef({
  id: "economize"
});

const economizePlugin = createPlugin({
  id: "economize",
  apis: [
    createApiFactory({
      api: economizeApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => new EconomomizeClient({ configApi })
    })
  ],
  routes: {
    root: rootRouteRef
  }
});
const EconomizePage = economizePlugin.provide(createRoutableExtension({
  name: "EconomizePage",
  component: () => import('./index-6bb47c9c.esm.js').then((m) => m.EconomizePage),
  mountPoint: rootRouteRef
}));

export { EconomizePage as E, economizePlugin as a, EconomomizeClient as b, color as c, economizeApiRef as e, formatWithCurrencyUnit as f };
//# sourceMappingURL=index-9e3f9969.esm.js.map
