/* eslint-disable react-hooks/refs */
import {
  createContext,
  useContext,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
} from "react";
import { createStore, type PayloadAction } from "@ecosy/store";
import { createStoreOrder } from "@ecosy/react";
import styles from "./collapsible.module.scss";

// 1. STATE MANAGEMENT
export interface CollapsibleState {
  isOpen: boolean;
}

function createStorable(initialState: CollapsibleState) {
  return createStore({
    initialState,
    reducers: {
      setOpen(state, action: PayloadAction<boolean>) {
        state.isOpen = action.payload;
      },
      toggle(state) {
        state.isOpen = !state.isOpen;
      },
    },
  });
}

type Storable = ReturnType<typeof createStorable>;
const CollapsibleContext = createContext<Storable | undefined>(undefined);

function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible components must be used within a Collapsible");
  }
  return context;
}

function useCollapsibleSelector<Selected>(selector: (state: CollapsibleState) => Selected) {
  const { store } = useCollapsible();
  return createStoreOrder<CollapsibleState, typeof store>(store)(selector);
}

// 2. COLLAPSIBLE WRAPPER
export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function Collapsible({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className = "",
  ...props
}: CollapsibleProps) {
  const storeRef = useRef<Storable | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStorable({
      isOpen: open !== undefined ? open : defaultOpen,
    });
  }

  const { actions, store } = storeRef.current;

  // Sync external controlled 'open' state
  useEffect(() => {
    if (open !== undefined) {
      actions.setOpen(open);
    }
  }, [open, actions]);

  // Sync external onOpenChange using a subscription to local store
  useEffect(() => {
    if (onOpenChange) {
      const unsubscribe = store.onStateChange((state) => {
        onOpenChange(state.isOpen);
      });
      return unsubscribe;
    }
  }, [store, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={storeRef.current}>
      <div className={`${styles.collapsible} ${className}`} data-disabled={disabled} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

// 3. TRIGGER
export interface CollapsibleTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function CollapsibleTrigger({ children, asChild, className = "", onClick, ...props }: CollapsibleTriggerProps) {
  const { actions } = useCollapsible();
  const isOpen = useCollapsibleSelector((state) => state.isOpen);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    actions.toggle();
    if (onClick) onClick(e);
  };

  if (asChild && isValidElement<HTMLAttributes<HTMLElement>>(children)) {
    return cloneElement(children, {
      "data-state": isOpen ? "open" : "closed",
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleClick(e);
        if (children.props.onClick) children.props.onClick(e);
      },
      ...props,
    } as HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      type="button"
      data-state={isOpen ? "open" : "closed"}
      className={`${styles.trigger} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// 4. CONTENT
export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function CollapsibleContent({ children, asChild, className = "", ...props }: CollapsibleContentProps) {
  const isOpen = useCollapsibleSelector((state) => state.isOpen);

  if (asChild && isValidElement<HTMLAttributes<HTMLElement>>(children)) {
    return cloneElement(children, {
      className: `${styles.content} ${isOpen ? styles.open : ""} ${className || children.props.className || ""}`,
      "data-state": isOpen ? "open" : "closed",
      ...props,
    } as HTMLAttributes<HTMLElement>);
  }

  return (
    <div
      className={`${styles.content} ${isOpen ? styles.open : ""} ${className}`}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <div className={styles.contentInner}>{children}</div>
    </div>
  );
}
