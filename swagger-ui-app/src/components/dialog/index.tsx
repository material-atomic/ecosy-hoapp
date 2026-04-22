/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/refs */
import {
  createContext,
  useContext,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { createStore, type PayloadAction } from "@ecosy/store";
import { createStoreOrder } from "@ecosy/react";
import styles from "./dialog.module.scss";

// 1. STATE MANAGEMENT
export interface DialogState {
  isOpen: boolean;
}

function createStorable(initialState: DialogState) {
  return createStore({
    initialState,
    reducers: {
      setOpen(state, action: PayloadAction<boolean>) {
        state.isOpen = action.payload;
      },
      close(state) {
        state.isOpen = false;
      },
      open(state) {
        state.isOpen = true;
      },
      toggle(state) {
        state.isOpen = !state.isOpen;
      },
    },
  });
}

type Storable = ReturnType<typeof createStorable>;
const DialogContext = createContext<Storable | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

function useDialogSelector<Selected>(selector: (state: DialogState) => Selected) {
  const { store } = useDialog();
  return createStoreOrder<DialogState, typeof store>(store)(selector);
}

// 2. DIALOG WRAPPER
export interface DialogProps extends PropsWithChildren {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: DialogProps) {
  const storeRef = useRef<Storable | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStorable({
      isOpen: open !== undefined ? open : defaultOpen,
    });
  }

  const { actions, store } = storeRef.current;

  useEffect(() => {
    if (open !== undefined) {
      actions.setOpen(open);
    }
  }, [open, actions]);

  useEffect(() => {
    if (onOpenChange) {
      const unsubscribe = store.onStateChange((state) => {
        onOpenChange(state.isOpen);
      });
      return unsubscribe;
    }
  }, [store, onOpenChange]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && store.getState().isOpen) {
        actions.close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actions, store]);

  return <DialogContext.Provider value={storeRef.current}>{children}</DialogContext.Provider>;
}

// 3. TRIGGER
export interface DialogTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function DialogTrigger({ children, asChild, onClick, ...props }: DialogTriggerProps) {
  const { actions } = useDialog();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    actions.open();
    if (onClick) onClick(e);
  };

  if (asChild && isValidElement<HTMLAttributes<HTMLElement>>(children)) {
    return cloneElement(children, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleClick(e);
        if (children.props.onClick) children.props.onClick(e);
      },
      ...props,
    } as HTMLAttributes<HTMLElement>);
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

// 4. CONTENT (Rendered in portal)
export type DialogContentProps = HTMLAttributes<HTMLDivElement>;

export function DialogContent({ children, className = "", ...props }: DialogContentProps) {
  const isOpen = useDialogSelector((state) => state.isOpen);
  const { actions } = useDialog();

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onPointerDown={() => actions.close()}>
      <div 
        className={`${styles.content} ${className}`} 
        onPointerDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// 5. HEADER
export type DialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ children, className = "", ...props }: DialogHeaderProps) {
  return (
    <div className={`${styles.header} ${className}`} {...props}>
      {children}
    </div>
  );
}

// 6. TITLE
export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function DialogTitle({ children, className = "", ...props }: DialogTitleProps) {
  return (
    <h2 className={`${styles.title} ${className}`} {...props}>
      {children}
    </h2>
  );
}
