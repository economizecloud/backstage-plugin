import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const economizePlugin = createPlugin({
  id: 'economize',
  routes: {
    root: rootRouteRef,
  },
});

export const EconomizePage = economizePlugin.provide(
  createRoutableExtension({
    name: 'EconomizePage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
