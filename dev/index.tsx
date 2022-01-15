import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { economizePlugin, EconomizePage } from '../src/plugin';

createDevApp()
  .registerPlugin(economizePlugin)
  .addPage({
    element: <EconomizePage />,
    title: 'Root Page',
    path: '/economize'
  })
  .render();
