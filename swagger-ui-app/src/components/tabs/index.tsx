/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import styles from "./tabs.module.scss";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs components must be wrapped in <Tabs />");
  return context;
}

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
  const currentValue = value !== undefined ? value : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    setUncontrolledValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={`${styles.tabs} ${className}`.trim()}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.tabList} ${className}`.trim()} role="tablist">{children}</div>;
}

export function TabItem({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useTabs();
  const isActive = ctx.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`${styles.tabItem} ${isActive ? styles.active : ""} ${className}`.trim()}
      onClick={() => ctx.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabPanes({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`${styles.tabPanes} ${className}`.trim()} style={style}>{children}</div>;
}

export function TabContent({ value, children, className = "", style }: { value: string; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const ctx = useTabs();
  if (ctx.value !== value) return null;
  return <div className={`${styles.tabContent} ${className}`.trim()} style={style} role="tabpanel">{children}</div>;
}
