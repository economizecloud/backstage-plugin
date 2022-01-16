import { ConfigProvider } from '../../hooks/useConfig';
import { EconomizePage } from './EconomizePage';
import React from 'react';
import { ScrollProvider } from '../../hooks/useScroll';

export const EconomizePageRoot = () => (
  <ConfigProvider>
    <ScrollProvider>
      <EconomizePage />
    </ScrollProvider>
  </ConfigProvider>
);
