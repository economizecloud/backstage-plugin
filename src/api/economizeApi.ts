import { createApiRef } from '@backstage/core-plugin-api';

export interface MonthlyCost {
  labels: string[];
  data: number[];
}

export interface EconomizeApi {
  getMonthlyCost: () => Promise<MonthlyCost>;
  getDailyCost: () => Promise<MonthlyCost>;
}

export const economizeApiRef = createApiRef<EconomizeApi>({
  id: 'plugin.economize.service',
});
