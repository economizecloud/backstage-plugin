import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Config as BackstageConfig } from '@backstage/config';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

export type ConfigContextProps = {
  table: string;
};

export const ConfigContext = createContext<ConfigContextProps | undefined>(
  undefined,
);

const defaultState: ConfigContextProps = {
  table: '',
};

export const ConfigProvider = ({ children }: PropsWithChildren<{}>) => {
  const c: BackstageConfig = useApi(configApiRef);
  const [config, setConfig] = useState(defaultState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function getTable(): string {
      const table = "c.getString('economize.table');";
      return table;
    }

    function getConfig() {
      const table = getTable();

      setConfig(prevState => ({
        ...prevState,
        table,
      }));

      setLoading(false);
    }

    getConfig();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return null;
  }

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export function useConfig(): ConfigContextProps {
  const config = useContext(ConfigContext);
  return config ? config : assertNever();
}

function assertNever(): never {
  throw new Error('Cannot use useConfig outside of ConfigProvider');
}
