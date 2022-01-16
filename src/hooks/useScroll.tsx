import React, {
  Dispatch,
  SetStateAction,
  useState,
  useContext,
  PropsWithChildren,
} from 'react';

export type Maybe<T> = T | null;
export type ScrollTo = Maybe<string>;

export type ScrollContextProps = {
  scroll: ScrollTo;
  setScroll: Dispatch<SetStateAction<ScrollTo>>;
};

export const ScrollContext = React.createContext<
  ScrollContextProps | undefined
>(undefined);

export const ScrollProvider = ({ children }: PropsWithChildren<{}>) => {
  const [scroll, setScroll] = useState<ScrollTo>(null);
  return (
    <ScrollContext.Provider value={{ scroll, setScroll }}>
      {children}
    </ScrollContext.Provider>
  );
};

export enum ScrollType {
  AlertSummary = 'alert-status-summary',
}

export function useScroll() {
  const context = useContext(ScrollContext);

  if (!context) {
    assertNever();
  }

  return [context.scroll, context.setScroll] as const;
}

function assertNever(): never {
  throw new Error(`Cannot use useScroll outside ScrollProvider`);
}
