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

export interface EconomizeApi {
  getMonthlyCost: (isCredit: boolean) => Promise<MonthlyCost>;
  getDailyCost: (isCredit: boolean) => Promise<MonthlyCost>;
  getWeeklyCost: (isCredit: boolean) => Promise<WeeklyCost>;
  getTopServices: (isCredit: boolean) => Promise<ServiceCost[]>;
}

export const economizeApiRef = createApiRef<EconomizeApi>({
  id: 'plugin.economize.service',
});
