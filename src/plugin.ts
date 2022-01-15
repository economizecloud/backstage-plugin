import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { economizeApiRef } from './api/economizeApi';
import { EconomomizeClient } from './api/economizeClient';

import { rootRouteRef } from './routes';

export const economizePlugin = createPlugin({
  id: 'economize',
  apis: [
    createApiFactory({
      api: economizeApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => new EconomomizeClient({ configApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const EconomizePage = economizePlugin.provide(
  createRoutableExtension({
    name: 'EconomizePage',
    component: () =>
      import('./components/EconomizePage').then(m => m.EconomizePage),
    mountPoint: rootRouteRef,
  }),
);
