import { createApiRef } from '@backstage/core-plugin-api';

export interface MonthlyCost {
  labels: string[];
  data: number[];
}
export interface WeeklyCost {
  labels: string[][];
  data: number[];
}
export interface ServiceCost {
  service: string;
  month: string;
  amount: number;
  name: string;
}
export interface OrgName {
  name: string;
  OrgID: string;
  AccID: string;
}
export interface Anomalies {
  anomalies: Anomaly[];
  bounds: Anomaly[];
  project_id: string;
  total_anomaly_cost: number;
}

export interface Anomaly {
  actual_cost: number;
  anomalyTimestamp: string;
  anomalyTimestampISO: string;
  expected_cost_range: number[];
  label: string;
}

export interface EconomizeApi {
  getMonthlyCost: (isCredit: boolean) => Promise<MonthlyCost>;
  getDailyCost: (isCredit: boolean) => Promise<MonthlyCost>;
  getWeeklyCost: (isCredit: boolean) => Promise<WeeklyCost>;
  getTopServices: (isCredit: boolean) => Promise<ServiceCost[]>;
  getOrgAndProject: () => Promise<OrgName>;
  getAnomalyDelection: (startDate: Date, endDate: Date) => Promise<Anomalies>;
}

export const economizeApiRef = createApiRef<EconomizeApi>({
  id: 'plugin.economize.service',
});
