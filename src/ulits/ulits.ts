import { StartQueryExecutionCommand } from '@aws-sdk/client-athena';
import { GetQueryResultsCommand } from '@aws-sdk/client-athena';
import { AthenaClient } from '@aws-sdk/client-athena';
import { ConfigApi } from '@backstage/core-plugin-api';

export const waitFor = (delay: number) =>
  new Promise(resolve => setTimeout(resolve, delay));

export const getWeekRange = (weekNo: number, yearNo: number) => {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let firstDayofYear = new Date(yearNo, 0, 1);
  if (firstDayofYear.getDay() > 4) {
    let weekStart = new Date(
      yearNo,
      0,
      1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 7,
    );
    let weekEnd = new Date(
      yearNo,
      0,
      1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 7 + 6,
    );
    return `${weekStart.getDate()} ${
      monthNames[weekStart.getMonth()]
    } - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]}`;
  } else {
    let weekStart = new Date(
      yearNo,
      0,
      1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 1,
    );
    let weekEnd = new Date(
      yearNo,
      0,
      1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 1 + 5,
    );
    return `${weekStart.getDate()} ${
      monthNames[weekStart.getMonth()]
    } - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]}`;
  }
};

export const fetchQuery = async (configApi: ConfigApi, QueryString: string) => {
  const athenaClient = new AthenaClient({
    region: configApi.getString('economize.region'),
    credentials: {
      accessKeyId: configApi.getString('economize.accessKeyId'),
      secretAccessKey: configApi.getString('economize.secretAccessKey'),
    },
  });

  const fetchWeeklyCost = new StartQueryExecutionCommand({
    QueryString: QueryString,
    WorkGroup: configApi.getString('economize.workGroup'),
    ResultConfiguration: {
      OutputLocation: configApi.getString('economize.outputLocation'),
    },
  });
  const response = await athenaClient.send(fetchWeeklyCost);

  await waitFor(2000);

  const getResultQuery = new GetQueryResultsCommand({
    QueryExecutionId: response.QueryExecutionId,
  });
  const fetchResultData = await athenaClient.send(getResultQuery);

  return fetchResultData;
};

export const color = [
  'rgb(27, 175, 252)', // blue-500
  'rgb(161, 222, 254)', // blue-400
  'rgb(40, 79, 147)', // blue-700
  'rgb(39, 127, 254)', // blue-600
  'rgb(107, 97, 243)', // blue-300
  'rgb(65, 54, 219)', // purple-700
  'rgb(53, 44, 186)', // purple-600
  'rgb(88, 77, 236)', // purple-500
  'rgb(107, 97, 243)', // purple-400
  'rgb(136, 120, 252)', // purple-300
];

export const formatWithCurrencyUnit = (cost: string, code = 'USD') => {
  if (!(code in currencyCodeSymbolMap)) {
    return numberWithCommas(cost).toString() + ' ' + code;
  }
  const symbol = currencyCodeSymbolMap[code];
  return symbol + ' ' + getNumberUnit(cost);
};

const numberWithCommas = x => {
  return round2Places(parseFloat(x)).toLocaleString('en-US');
};

const round2Places = num => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

function getNumberUnit(labelValue) {
  const sign = Math.sign(Number(labelValue));
  // Nine Zeroes for Billions
  return Number(labelValue) >= 1.0e9
    ? sign * (Number(labelValue) / 1.0e9).toFixed(2) + 'B'
    : // Six Zeroes for Millions
    Number(labelValue) >= 1.0e6
    ? sign * (Number(labelValue) / 1.0e6).toFixed(2) + 'M'
    : // Three Zeroes for Thousands
    Number(labelValue) >= 1.0e3
    ? sign * (Number(labelValue) / 1.0e3).toFixed(2) + 'K'
    : Number(labelValue) === 0.0e3
    ? sign * Number(labelValue)
    : Number(labelValue).toFixed(2);
}

const currencyCodes = [
  {
    code: 'USD',
    symbol: '$',
  },
  {
    code: 'EUR',
    symbol: '€',
  },
  {
    code: 'INR',
    symbol: '₹',
  },
  {
    code: 'AUD',
    symbol: '',
  },
  {
    code: 'NOK',
    symbol: '',
  },
  {
    code: 'BRL',
    symbol: '',
  },
  {
    code: 'CAD',
    symbol: '',
  },
  {
    code: 'CZK',
    symbol: '',
  },
  {
    code: 'DKK',
    symbol: '',
  },
  {
    code: 'HKD',
    symbol: '',
  },
  {
    code: 'IDR',
    symbol: 'Rp',
  },
  {
    code: 'ILS',
    symbol: '',
  },
  {
    code: 'JPY',
    symbol: '',
  },
  {
    code: 'CHF',
    symbol: '',
  },
  {
    code: 'MYR',
    symbol: '',
  },
  {
    code: 'MXN',
    symbol: '',
  },
  {
    code: 'NZD',
    symbol: '',
  },
  {
    code: 'PLN',
    symbol: '',
  },
  {
    code: 'RUB',
    symbol: '',
  },
  {
    code: 'SGD',
    symbol: '',
  },
  {
    code: 'KRW',
    symbol: '',
  },
  {
    code: 'SEK',
    symbol: '',
  },
  {
    code: 'TWD',
    symbol: '',
  },
  {
    code: 'THB',
    symbol: '',
  },
  {
    code: 'TRY',
    symbol: '',
  },
  {
    code: 'GBP',
    symbol: '',
  },
  {
    code: 'VND',
    symbol: '',
  },
];

const currencyCodeSymbolMap = currencyCodes.reduce((map, obj) => {
  map[obj.code] = obj.symbol;
  return map;
}, {});
