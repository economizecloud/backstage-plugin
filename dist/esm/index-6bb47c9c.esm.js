import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { Card, CardHeader, Grid, Typography, Switch, CardContent, Box, CircularProgress, Paper, MenuList, MenuItem, ListItemText, Select } from '@material-ui/core';
import { Progress, Header, HeaderLabel, WarningPanel, Page, Content } from '@backstage/core-components';
import { e as economizeApiRef, f as formatWithCurrencyUnit, c as color } from './index-9e3f9969.esm.js';
import { subDays } from 'date-fns';
import '@aws-sdk/client-cost-explorer';
import '@aws-sdk/client-organizations';
import 'axios';
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Chart, BarElement } from 'chart.js';
import ChartJS from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';
import '@aws-sdk/client-athena';

const ConfigContext = createContext(void 0);
const defaultState = {
  table: ""
};
const ConfigProvider = ({ children }) => {
  useApi(configApiRef);
  const [config, setConfig] = useState(defaultState);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    function getTable() {
      const table = "c.getString('economize.table');";
      return table;
    }
    function getConfig() {
      const table = getTable();
      setConfig((prevState) => ({
        ...prevState,
        table
      }));
      setLoading(false);
    }
    getConfig();
  }, []);
  if (loading) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(ConfigContext.Provider, {
    value: config
  }, children);
};

const ScrollContext = React.createContext(void 0);
const ScrollProvider = ({ children }) => {
  const [scroll, setScroll] = useState(null);
  return /* @__PURE__ */ React.createElement(ScrollContext.Provider, {
    value: { scroll, setScroll }
  }, children);
};
function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    assertNever();
  }
  return [context.scroll, context.setScroll];
}
function assertNever() {
  throw new Error(`Cannot use useScroll outside ScrollProvider`);
}

const ScrollAnchor = ({ id }) => {
  const divRef = useRef(null);
  const [scroll, setScroll] = useScroll();
  useEffect(() => {
    function scrollIntoView() {
      if (divRef.current && scroll === id) {
        console.log(scroll, id, divRef.current);
        divRef.current.scrollIntoView({
          block: "start",
          inline: "start",
          behavior: "smooth"
        });
        setScroll(null);
      }
    }
    scrollIntoView();
  }, [scroll, setScroll, id]);
  return /* @__PURE__ */ React.createElement("div", {
    ref: divRef,
    "data-testid": `scroll-test-${id}`
  });
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
function BaseLine({
  data,
  isLegend,
  title,
  yAxesCallbackFunc,
  tooltipCallbackFunc
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 20,
    elements: {
      line: {
        tension: 0
      },
      point: {
        display: true,
        backgroundColor: "rgb(252, 152, 3)",
        radius: 0,
        hitRadius: 5,
        hoverRadius: 7
      }
    },
    pointStyle: "circle",
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0
      }
    },
    hover: { intersect: false },
    scales: {
      x: {
        display: true,
        color: "rgb(134, 147, 157)",
        borderDash: [2, 2],
        grid: {
          zeroLineColor: "rgba(217, 217, 217,0.25)",
          color: "rgba(217, 217, 217,0.6)",
          borderDash: [2, 2],
          drawTicks: false
        },
        ticks: {
          beginAtZero: true,
          font: {
            size: 12,
            family: "Inter",
            color: "rgb(134, 147, 157)"
          },
          padding: 10,
          fontFamily: "Inter",
          maxTicksLimit: 15,
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0
        },
        pointLabels: {
          fontFamily: "Inter"
        }
      },
      y: {
        display: true,
        color: "rgb(134, 147, 157)",
        grid: {
          zeroLineColor: "rgba(238, 238, 238,0.6)",
          drawTicks: false,
          color: "rgba(238, 238, 238,0.6)"
        },
        ticks: {
          callback: yAxesCallbackFunc,
          beginAtZero: true,
          font: {
            size: 12,
            family: "Inter",
            color: "rgb(134, 147, 157)"
          },
          padding: 10,
          maxTicksLimit: 8
        },
        pointLabels: {
          fontFamily: "Inter"
        }
      }
    },
    animation: {
      x: {
        duration: 1500,
        from: 0
      },
      y: {
        duration: 1500,
        from: 500
      }
    },
    plugins: {
      legend: {
        display: isLegend,
        labels: {
          boxWidth: 10,
          display: isLegend,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 10,
          font: {
            size: 12,
            family: "Inter",
            color: "rgb(134, 147, 157)"
          }
        },
        position: "botton"
      },
      tooltip: {
        mode: "index",
        intersect: false,
        position: "average",
        backgroundColor: "rgba(0,0,0,0.7)",
        callbacks: tooltipCallbackFunc,
        caretSize: 10,
        caretPadding: 10,
        titleFontFamily: "Inter",
        bodyFontFamily: "Inter",
        usePointStyle: false,
        titleColor: "#fff",
        borderColor: "rgba(54,54,54,0.20)",
        borderWidth: 2.5
      },
      title: {
        display: true,
        text: title
      }
    }
  };
  return /* @__PURE__ */ React.createElement(Line, {
    options,
    data
  });
}

const MonthlyLineChart = () => {
  const MonthlyData = useApi(economizeApiRef);
  const [Credit, setCredit] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [data, setData] = useState({
    labels: [],
    datasets: []
  });
  const fetchMonthlyData = async () => {
    setLoading(true);
    const monthData = await MonthlyData.getMonthlyCost(Credit);
    setData({
      labels: monthData.labels,
      datasets: [
        {
          data: monthData.data,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)"
        }
      ]
    });
    setLoading(false);
  };
  useEffect(() => {
    fetchMonthlyData();
  }, [Credit]);
  return /* @__PURE__ */ React.createElement(Card, {
    style: { backgroundColor: "white", color: "black" }
  }, /* @__PURE__ */ React.createElement(ScrollAnchor, {
    id: "monthly-cost"
  }), Loading && /* @__PURE__ */ React.createElement(Progress, null), /* @__PURE__ */ React.createElement(CardHeader, {
    title: "Monthly Cost",
    action: /* @__PURE__ */ React.createElement(Grid, {
      container: true,
      direction: "row",
      justifyContent: "flex-end",
      alignItems: "center"
    }, /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2"
    }, "Show Credits"), /* @__PURE__ */ React.createElement(Switch, {
      disabled: Loading,
      checked: Credit,
      onChange: () => setCredit(!Credit)
    }))
  }), /* @__PURE__ */ React.createElement(CardContent, null, /* @__PURE__ */ React.createElement(Box, {
    sx: { height: 500 }
  }, /* @__PURE__ */ React.createElement(BaseLine, {
    yAxesCallbackFunc: (label) => {
      const formattedValue = formatWithCurrencyUnit((label === void 0 ? 0 : parseFloat(label)).toFixed(2));
      return formattedValue;
    },
    tooltipCallbackFunc: {
      label: function(context) {
        const labelValue = context.parsed.y;
        return ": " + formatWithCurrencyUnit((labelValue === void 0 ? 0 : parseFloat(labelValue)).toFixed(2));
      }
    },
    isLegend: false,
    title: "Monthly",
    data: !Loading ? data : {
      labels: [],
      datasets: []
    }
  }))));
};

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
function BaseBar({
  data,
  isLegend,
  title,
  yAxesCallbackFunc,
  tooltipCallbackFunc
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 20,
    elements: {
      line: {
        tension: 0
      },
      point: {
        display: true,
        backgroundColor: "rgb(252, 152, 3)",
        radius: 0,
        hitRadius: 5,
        hoverRadius: 7
      }
    },
    pointStyle: "circle",
    hover: { intersect: false },
    scales: {
      x: {
        display: true,
        color: "rgb(134, 147, 157)",
        borderDash: [2, 2],
        grid: {
          zeroLineColor: "rgba(217, 217, 217,0.25)",
          color: "rgba(217, 217, 217,0.6)",
          borderDash: [2, 2],
          drawTicks: false
        },
        ticks: {
          beginAtZero: true,
          font: {
            size: 12,
            family: "Inter",
            color: "rgb(134, 147, 157)"
          },
          padding: 10,
          fontFamily: "Inter",
          maxTicksLimit: 15,
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0
        },
        pointLabels: {
          fontFamily: "Inter"
        }
      },
      y: {
        display: true,
        color: "rgb(134, 147, 157)",
        grid: {
          zeroLineColor: "rgba(238, 238, 238,0.6)",
          drawTicks: false,
          color: "rgba(238, 238, 238,0.6)"
        },
        ticks: {
          callback: yAxesCallbackFunc,
          beginAtZero: true,
          font: {
            size: 12,
            family: "Inter",
            color: "rgb(134, 147, 157)"
          },
          padding: 10,
          maxTicksLimit: 8
        },
        pointLabels: {
          fontFamily: "Inter"
        }
      }
    },
    animation: {
      x: {
        duration: 1500,
        from: 0
      },
      y: {
        duration: 1500,
        from: 500
      }
    },
    plugins: {
      legend: {
        display: isLegend,
        position: "bottom",
        text: title,
        labels: {
          boxWidth: 10,
          display: true,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 10,
          font: {
            size: 12,
            family: "Inter",
            color: "rgb(134, 147, 157)"
          }
        }
      },
      tooltip: {
        callbacks: tooltipCallbackFunc,
        mode: "index",
        intersect: false,
        position: "nearest",
        backgroundColor: "rgba(0,0,0,0.7)",
        caretSize: 10,
        caretPadding: 10,
        titleFontFamily: "Inter",
        bodyFontFamily: "Inter",
        usePointStyle: false,
        titleColor: "#fff",
        borderColor: "rgba(54,54,54,0.20)",
        borderWidth: 2.5
      }
    }
  };
  data.datasets = data.datasets.map((item, index) => {
    return {
      ...item,
      fill: true,
      pointStyle: "circle",
      backgroundColor: color[index % color.length],
      borderColor: color[index % color.length],
      pointBackgroundColor: color[index % color.length],
      barThickness: 30,
      pointHoverRadius: 7,
      pointBorderWidth: 1,
      pointHoverBorderWidth: 4,
      pointHoverBackgroundColor: "rgb(255, 255, 255)",
      categoryPercentage: 1,
      barPercentage: 0.7
    };
  });
  return /* @__PURE__ */ React.createElement(Bar, {
    options,
    data
  });
}

const ServiceMonthlyBarChart = () => {
  const MonthlyData = useApi(economizeApiRef);
  const [data, setData] = useState({
    labels: [],
    datasets: []
  });
  const [Credit, setCredit] = useState(false);
  const [Loading, setLoading] = useState(false);
  const fetchMonthlyData = async () => {
    setLoading(true);
    let dataset = [];
    const label = [];
    const monthData = await MonthlyData.getTopServices(Credit);
    const isLabelExist = {};
    const isDatasetExist = {};
    let count = 0;
    monthData.forEach((arr) => {
      if (!isLabelExist[arr.month]) {
        isLabelExist[arr.month] = true;
        label.push(arr.month);
      }
      if (isDatasetExist[arr.service]) {
        dataset[isDatasetExist[arr.service]].data.push(arr.amount);
      } else {
        isDatasetExist[arr.service] = count;
        dataset.push({
          data: [arr.amount],
          label: arr.name
        });
        count++;
      }
    });
    dataset = dataset.sort(function(a, b) {
      const bdata = b.data.reduce((a2, b2) => parseFloat(a2) + parseFloat(b2));
      const adata = a.data.reduce((a2, b2) => parseFloat(a2) + parseFloat(b2));
      return bdata - adata;
    }).slice(0, 5);
    setData({
      labels: label,
      datasets: dataset
    });
    setLoading(false);
  };
  useEffect(() => {
    fetchMonthlyData();
  }, [Credit]);
  return /* @__PURE__ */ React.createElement(Card, {
    style: { backgroundColor: "white", color: "black" }
  }, /* @__PURE__ */ React.createElement(ScrollAnchor, {
    id: "top-components"
  }), /* @__PURE__ */ React.createElement(CardHeader, {
    title: "Top Components",
    action: /* @__PURE__ */ React.createElement(Grid, {
      container: true,
      direction: "row",
      justifyContent: "flex-end",
      alignItems: "center"
    }, /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2"
    }, "Show Credits"), /* @__PURE__ */ React.createElement(Switch, {
      disabled: Loading,
      checked: Credit,
      onChange: () => setCredit(!Credit)
    }))
  }), /* @__PURE__ */ React.createElement(CardContent, null, /* @__PURE__ */ React.createElement(Box, {
    sx: { height: 500 }
  }, /* @__PURE__ */ React.createElement("div", null, Loading ? /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "row",
    justifyContent: "center",
    alignItems: "center"
  }, /* @__PURE__ */ React.createElement(CircularProgress, null)) : /* @__PURE__ */ React.createElement(Box, {
    sx: { height: 500 }
  }, /* @__PURE__ */ React.createElement(BaseBar, {
    yAxesCallbackFunc: (label) => {
      const formattedValue = formatWithCurrencyUnit((label === void 0 ? 0 : parseFloat(label)).toFixed(2));
      return formattedValue;
    },
    tooltipCallbackFunc: {
      label: function(context) {
        const label = context.dataset.label;
        const labelValue = context.parsed.y;
        return label + ": " + formatWithCurrencyUnit((labelValue === void 0 ? 0 : parseFloat(labelValue)).toFixed(2));
      }
    },
    isLegend: true,
    title: "Top Service",
    data
  }))))));
};

const DailyLineChart$2 = () => {
  const DailyData = useApi(economizeApiRef);
  const [Credit, setCredit] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [data, setData] = useState({
    labels: [],
    datasets: []
  });
  const fetchDailyData = async () => {
    setLoading(true);
    const monthData = await DailyData.getDailyCost(Credit);
    setData({
      labels: monthData.labels,
      datasets: [
        {
          data: monthData.data,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)"
        }
      ]
    });
    setLoading(false);
  };
  useEffect(() => {
    fetchDailyData();
  }, [Credit]);
  return /* @__PURE__ */ React.createElement(Card, {
    style: { backgroundColor: "white", color: "black" }
  }, /* @__PURE__ */ React.createElement(ScrollAnchor, {
    id: "daily-cost"
  }), Loading && /* @__PURE__ */ React.createElement(Progress, null), /* @__PURE__ */ React.createElement(CardHeader, {
    title: "Daily Cost",
    action: /* @__PURE__ */ React.createElement(Grid, {
      container: true,
      direction: "row",
      justifyContent: "flex-end",
      alignItems: "center"
    }, /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2"
    }, "Show Credits"), /* @__PURE__ */ React.createElement(Switch, {
      disabled: Loading,
      checked: Credit,
      onChange: () => setCredit(!Credit)
    }))
  }), /* @__PURE__ */ React.createElement(CardContent, null, /* @__PURE__ */ React.createElement(Box, {
    sx: { height: 500 }
  }, /* @__PURE__ */ React.createElement(BaseLine, {
    yAxesCallbackFunc: (label) => {
      const formattedValue = formatWithCurrencyUnit((label === void 0 ? 0 : parseFloat(label)).toFixed(2));
      return formattedValue;
    },
    tooltipCallbackFunc: {
      label: function(context) {
        const labelValue = context.parsed.y;
        return ": " + formatWithCurrencyUnit((labelValue === void 0 ? 0 : parseFloat(labelValue)).toFixed(2));
      }
    },
    isLegend: false,
    title: "Daily",
    data: !Loading ? data : {
      labels: [],
      datasets: []
    }
  }))));
};

const DailyLineChart$1 = () => {
  const DailyData = useApi(economizeApiRef);
  const [Credit, setCredit] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [data, setData] = useState({
    labels: [],
    datasets: []
  });
  const fetchDailyData = async () => {
    setLoading(true);
    const monthData = await DailyData.getWeeklyCost(Credit);
    setData({
      labels: monthData.labels,
      datasets: [
        {
          data: monthData.data,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)"
        }
      ]
    });
    setLoading(false);
  };
  useEffect(() => {
    fetchDailyData();
  }, [Credit]);
  return /* @__PURE__ */ React.createElement(Card, {
    style: { backgroundColor: "white", color: "black" }
  }, /* @__PURE__ */ React.createElement(ScrollAnchor, {
    id: "weekly-cost"
  }), Loading && /* @__PURE__ */ React.createElement(Progress, null), /* @__PURE__ */ React.createElement(CardHeader, {
    title: "Weekly Cost",
    action: /* @__PURE__ */ React.createElement(Grid, {
      container: true,
      direction: "row",
      justifyContent: "flex-end",
      alignItems: "center"
    }, /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2"
    }, "Show Credits"), /* @__PURE__ */ React.createElement(Switch, {
      disabled: Loading,
      checked: Credit,
      onChange: () => setCredit(!Credit)
    }))
  }), /* @__PURE__ */ React.createElement(CardContent, null, /* @__PURE__ */ React.createElement(Box, {
    sx: { height: 500 }
  }, /* @__PURE__ */ React.createElement(BaseLine, {
    yAxesCallbackFunc: (label) => {
      const formattedValue = formatWithCurrencyUnit((label === void 0 ? 0 : parseFloat(label)).toFixed(2));
      return formattedValue;
    },
    tooltipCallbackFunc: {
      label: function(context) {
        const labelValue = context.parsed.y;
        return ": " + formatWithCurrencyUnit((labelValue === void 0 ? 0 : parseFloat(labelValue)).toFixed(2));
      }
    },
    isLegend: false,
    title: "Weekly",
    data: !Loading ? data : {
      labels: [],
      datasets: []
    }
  }))));
};

const menuData = [
  {
    name: "Overview",
    link: "overview"
  },
  {
    name: "Daily Cost",
    link: "daily-cost"
  },
  {
    name: "Weekly Cost",
    link: "weekly-cost"
  },
  {
    name: "Monthly Cost",
    link: "monthly-cost"
  },
  {
    name: "Top Components",
    link: "top-components"
  },
  {
    name: "Anomalies",
    link: "anomalies"
  },
  {
    name: "Documentation",
    link: "documentation"
  }
];
const Menu = () => {
  const [, setScroll] = useScroll();
  return /* @__PURE__ */ React.createElement(Paper, {
    style: { backgroundColor: "white", color: "black" },
    sx: { width: 320, maxWidth: "100%" }
  }, /* @__PURE__ */ React.createElement(MenuList, null, menuData.map((item) => /* @__PURE__ */ React.createElement(MenuItem, {
    key: item.link,
    "data-testid": `menu-item-${item.link}`,
    onClick: () => setScroll(item.link)
  }, /* @__PURE__ */ React.createElement(ListItemText, null, item.name)))));
};

const HeaderBanner = () => {
  const api = useApi(economizeApiRef);
  const [orgName, setOrgName] = useState({
    name: "",
    OrgID: "",
    AccID: ""
  });
  const fetchOrgName = async () => {
    const orgname = await api.getOrgAndProject();
    setOrgName(orgname);
  };
  useEffect(() => {
    fetchOrgName();
  }, []);
  return /* @__PURE__ */ React.createElement(Header, {
    title: "Cloud Cost Portal",
    subtitle: "powered by economize.cloud"
  }, orgName.name && /* @__PURE__ */ React.createElement(HeaderLabel, {
    value: orgName.name,
    label: "Organization"
  }), orgName.OrgID && /* @__PURE__ */ React.createElement(HeaderLabel, {
    value: orgName.OrgID,
    label: "Organization ID"
  }), orgName.AccID && /* @__PURE__ */ React.createElement(HeaderLabel, {
    value: orgName.AccID,
    label: "Account ID"
  }));
};

const ErrorMessageMap = {
  "BACKSTAGE/API_KEY_MISSING": "API key is required",
  "BACKSTAGE/API_KEY_UNVERIFIED": "API key is not verified",
  "BACKSTAGE/SERVICE_UNAVAILABLE": "Service Unavailable",
  "BACKSTAGE/SOMETHING_WRONG": "Something Wrong, Please refresh again or try again later"
};

const anomalyChartOptsConstants = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      tension: 0
    },
    point: {
      display: true,
      backgroundColor: "rgb(252, 152, 3)",
      pointHoverRadius: 15
    }
  },
  pointStyle: "circle",
  hover: { mode: "nearest", intersect: true },
  scales: {
    x: {
      display: true,
      grid: {
        zeroLineColor: "#000000",
        lineWidth: 0
      },
      ticks: {
        beginAtZero: true,
        font: {
          size: 12,
          family: "Inter",
          color: "rgb(134, 147, 157)"
        },
        padding: 15,
        autoSkip: true,
        maxTicksLimit: 11,
        maxRotation: 0,
        minRotation: 0,
        callback: function(label) {
          let realLabel = this.getLabelForValue(label);
          let timestamp, date, time;
          timestamp = new Date(Date.parse(realLabel));
          date = timestamp.getDate() + " " + timestamp.toLocaleString("en-us", { month: "short" });
          time = timestamp.toLocaleString("en-us", {
            hour: "numeric",
            minute: "numeric",
            hour12: true
          });
          return [date, time];
        }
      }
    },
    y: {
      display: true,
      grid: {
        zeroLineColor: "#000000",
        lineWidth: 0
      },
      ticks: {
        beginAtZero: true,
        callback: function(value) {
          if (parseInt(value, 10) >= 1e3) {
            return formatWithCurrencyUnit(value);
          }
          return formatWithCurrencyUnit(value);
        },
        font: {
          size: 12,
          family: "Inter",
          color: "rgb(134, 147, 157)"
        },
        padding: 15
      },
      pointLabels: {
        fontFamily: "Inter"
      }
    }
  },
  plugins: {
    tooltip: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label;
          const labelValue = context.parsed.y;
          const value = formatWithCurrencyUnit(labelValue.toFixed(3));
          return `${label}: ${value}`;
        },
        title: function(tooltipItem, data) {
          const timestamp = new Date(tooltipItem[0]["label"]);
          const label = timestamp.toLocaleString("en-us", {
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "numeric",
            hour12: true
          });
          return label;
        },
        afterBody: function() {
          return [];
        }
      },
      titleFontFamily: "Inter",
      bodyFontFamily: "Inter"
    },
    legend: {
      labels: {
        font: {
          family: "Inter",
          color: "#000000",
          weight: 500,
          size: 12
        },
        color: "#000000",
        padding: 15
      },
      position: "bottom",
      display: false
    }
  }
};

const DailyLineChart = () => {
  const DailyData = useApi(economizeApiRef);
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("WEEKLY");
  const daysMenu = [
    {
      name: "Weekly",
      value: "WEEKLY"
    },
    {
      name: "Monthly",
      value: "MONTHLY"
    },
    {
      name: "14 Days",
      value: "14DAYS"
    }
  ];
  const [data, setData] = useState({
    labels: [],
    datasets: []
  });
  const [Options, setOptions] = useState(anomalyChartOptsConstants);
  const boundColor = (ctx, color) => {
    return color[ctx.p0DataIndex];
  };
  const dateCondition = {
    WEEKLY: {
      StartDate: subDays(new Date(), 7),
      EndDate: new Date()
    },
    MONTHLY: {
      StartDate: subDays(new Date(), 31),
      EndDate: new Date()
    },
    "14DAYS": {
      StartDate: subDays(new Date(), 14),
      EndDate: new Date()
    }
  };
  const fetchDailyData = async () => {
    var _a, _b, _c, _d;
    setLoading(true);
    try {
      const anomalyChartOpts = anomalyChartOptsConstants;
      const anomalyIndexMap = {};
      const anomalyData = await DailyData.getAnomalyDelection(dateCondition[date].StartDate, dateCondition[date].EndDate);
      if (!anomalyData.anomalies) {
        setLoading(false);
        return;
      }
      anomalyData.bounds.sort(function(x, y) {
        const firstDate = Date.parse(x.anomalyTimestampISO);
        const secondDate = Date.parse(y.anomalyTimestampISO);
        return firstDate - secondDate;
      });
      let projectLevelLineColor = [];
      let chartData = {
        type: "line",
        labels: [],
        labelTimestamps: [],
        datasets: [
          {
            data: [],
            label: "Actual Costs",
            borderColor: "rgba(27,175,252,1)",
            fill: false,
            pointHoverRadius: 10,
            segment: {
              borderColor: (ctx) => {
                return boundColor(ctx, projectLevelLineColor);
              }
            }
          },
          {
            data: [],
            label: "Upper Bound",
            backgroundColor: "rgba(27,175,252, 0.1)",
            borderColor: "rgba(27,175,252, 0.3)",
            fill: "+1"
          },
          {
            data: [],
            label: "Lower Bound",
            backgroundColor: "rgba(27,175,2529, 0.1)",
            borderColor: "rgba(27,175,252,0.3)",
            fill: "-1"
          }
        ]
      };
      chartData.datasets[0].data = anomalyData.bounds.map((b) => b.actual_cost);
      anomalyData.bounds.forEach((b) => {
        if (b.label === "2") {
          projectLevelLineColor.push("rgb(252, 152, 3)");
        } else {
          projectLevelLineColor.push("rgb(27, 175, 252)");
        }
      });
      chartData.datasets[2].data = anomalyData.bounds.map((b) => b.expected_cost_range[0] < 0 ? 0 : b.expected_cost_range[0]);
      chartData.datasets[1].data = anomalyData.bounds.map((b) => b.expected_cost_range[1]);
      chartData.labels = anomalyData.bounds.map((b) => b.anomalyTimestampISO);
      chartData.labelTimestamps = anomalyData.bounds.map((b) => b.anomalyTimestamp);
      anomalyData.bounds.forEach((bound, index) => {
        if (anomalyData.anomalies.some((anomaly) => anomaly.anomalyTimestampISO === bound.anomalyTimestampISO)) {
          anomalyIndexMap[index] = bound.anomalyTimestampISO;
        }
      });
      anomalyChartOpts.elements.point["radius"] = (context) => {
        if (context.dataset.label !== "Actual Costs") {
          return 0;
        }
        let index = context.dataIndex;
        return index in anomalyIndexMap ? 8 : 0;
      };
      anomalyChartOpts.plugins.tooltip["callbacks"]["label"] = (context) => {
        const label = context.dataset.label;
        const labelValue = context.parsed.y;
        const value = formatWithCurrencyUnit(labelValue.toFixed(3));
        if (`${label}` === "Actual Costs") {
          return `${label}:${value}`;
        }
        return "";
      };
      setData(chartData);
      setOptions(anomalyChartOpts);
    } catch (err) {
      if (err == null ? void 0 : err.response) {
        setError((_d = ErrorMessageMap[(_c = (_b = (_a = err == null ? void 0 : err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.error) == null ? void 0 : _c.message]) != null ? _d : ErrorMessageMap["BACKSTAGE/SOMETHING_WRONG"]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDailyData();
  }, [date]);
  return /* @__PURE__ */ React.createElement(Card, {
    style: { backgroundColor: "white", color: "black" }
  }, /* @__PURE__ */ React.createElement(ScrollAnchor, {
    id: "anomalies"
  }), error && /* @__PURE__ */ React.createElement(WarningPanel, {
    title: error,
    severity: error.includes("Unavailable") || error.includes("Something") ? "error" : "warning"
  }), Loading && /* @__PURE__ */ React.createElement(Progress, null), /* @__PURE__ */ React.createElement(CardHeader, {
    title: "Anomalies Cost",
    action: /* @__PURE__ */ React.createElement(Select, {
      labelId: "demo-simple-select-label",
      id: "demo-simple-select",
      value: date,
      label: "Age",
      onChange: (e) => setDate(e.target.value)
    }, daysMenu.map((arr) => /* @__PURE__ */ React.createElement(MenuItem, {
      value: arr.value
    }, " ", arr.name)))
  }), /* @__PURE__ */ React.createElement(CardContent, null, /* @__PURE__ */ React.createElement(Box, {
    sx: { height: 500 }
  }, /* @__PURE__ */ React.createElement(Line, {
    options: Options,
    data
  }))));
};

const EconomizePage = () => {
  return /* @__PURE__ */ React.createElement(Page, {
    themeId: "service"
  }, /* @__PURE__ */ React.createElement(HeaderBanner, null), /* @__PURE__ */ React.createElement(Content, {
    style: { backgroundColor: "whitesmoke", color: "black" }
  }, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "row",
    spacing: 5
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    md: 2
  }, /* @__PURE__ */ React.createElement(Box, {
    position: "sticky",
    top: 20
  }, /* @__PURE__ */ React.createElement(Menu, null))), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    md: 10
  }, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "column"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true
  }, /* @__PURE__ */ React.createElement(DailyLineChart$2, null)), /* @__PURE__ */ React.createElement(Grid, {
    item: true
  }, /* @__PURE__ */ React.createElement(DailyLineChart$1, null)), /* @__PURE__ */ React.createElement(Grid, {
    item: true
  }, /* @__PURE__ */ React.createElement(MonthlyLineChart, null)), /* @__PURE__ */ React.createElement(Grid, {
    item: true
  }, /* @__PURE__ */ React.createElement(ServiceMonthlyBarChart, null)), /* @__PURE__ */ React.createElement(Grid, {
    item: true
  }, /* @__PURE__ */ React.createElement(DailyLineChart, null)))))));
};

const EconomizePageRoot = () => /* @__PURE__ */ React.createElement(ConfigProvider, null, /* @__PURE__ */ React.createElement(ScrollProvider, null, /* @__PURE__ */ React.createElement(EconomizePage, null)));

export { EconomizePageRoot as EconomizePage };
//# sourceMappingURL=index-6bb47c9c.esm.js.map
