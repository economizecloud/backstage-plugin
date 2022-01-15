import { ConfigProvider } from '../../hooks/useConfig';
import { EconomizePage } from './EconomizePage';
import React from 'react';

export const EconomizePageRoot = () => (
  <ConfigProvider>
    <EconomizePage />
  </ConfigProvider>
);
