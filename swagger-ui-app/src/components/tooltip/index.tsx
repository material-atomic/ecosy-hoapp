/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/refs */
import {
  useState,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
  useId,
  Children,
  type ReactElement,
  type MouseEvent,
  type FocusEvent,
  type HTMLAttributes,
  type RefAttributes,
  type Ref,
  type RefObject,
  type PropsWithChildren
} from "react";
import { createPortal } from "react-dom";
import { createStore, type PayloadAction } from "@ecosy/store";
import { createStoreOrder } from "@ecosy/react";
import styles from "./tooltip.module.scss";

// 1. GLOBAL STORE (@ecosy/store)
export type SimpleRect = { top: number; bottom: number; left: number; right: number; width: number; height: number };

export interface TooltipState {
  activeId: string | null;
  triggerRect: SimpleRect | null;
}

const initialState: TooltipState = {
  activeId: null,
  triggerRect: null,
};

export const tooltipStore = createStore({
  initialState,
  reducers: {
    open(state, action: PayloadAction<{ id: string; rect: SimpleRect }>) {
      state.activeId = action.payload.id;
      state.triggerRect = action.payload.rect;
    },
    close(state, action: PayloadAction<string>) {
      if (state.activeId === action.payload) {
        state.activeId = null;
        state.triggerRect = null;
      }
    }
  }
});

// Hook to consume global store
const useTooltipSelector = createStoreOrder<TooltipState, typeof tooltipStore.store>(tooltipStore.store);

// 2. TOOLTIP WRAPPER (No Context!)
export interface TooltipProps extends PropsWithChildren {
  delay?: number;
}

export function Tooltip({ children, delay = 200 }: TooltipProps) {
  const id = useId();
  
  return (
    <>
      {Children.map(children, child => {
        if (isValidElement<HTMLAttributes<HTMLElement>>(child)) {
          // Pass down the identifiers implicitly
          return cloneElement(child, { tooltipId: id, delay } as HTMLAttributes<HTMLElement>);
        }
        return child;
      })}
    </>
  );
}

// 3. TOOLTIP TRIGGER
export interface TooltipTriggerProps extends PropsWithChildren {
  asChild?: boolean;
  tooltipId?: string; // Auto-injected by <Tooltip>
  delay?: number;     // Auto-injected by <Tooltip>
}

export function TooltipTrigger({ children, asChild, tooltipId, delay = 200 }: TooltipTriggerProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = () => {
    if (!tooltipId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        tooltipStore.actions.open({ 
          id: tooltipId, 
          rect: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height
          } 
        });
      }
    }, delay);
  };

  const handleClose = () => {
    if (!tooltipId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => tooltipStore.actions.close(tooltipId), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const childrenProps = (children as ReactElement)?.props as HTMLAttributes<HTMLElement>;
  const triggerEvents = {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      handleOpen();
      if (isValidElement(children) && childrenProps.onMouseEnter) childrenProps.onMouseEnter(e);
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      handleClose();
      if (isValidElement(children) && childrenProps.onMouseLeave) childrenProps.onMouseLeave(e);
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      handleOpen();
      if (isValidElement(children) && childrenProps.onFocus) childrenProps.onFocus(e);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      handleClose();
      if (isValidElement(children) && childrenProps.onBlur) childrenProps.onBlur(e);
    }
  };

  if (asChild && isValidElement<HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>>(children)) {
    return cloneElement(children, {
      ref: (node: HTMLElement) => {
        triggerRef.current = node;
        type ChildWithRef = ReactElement & { ref?: Ref<HTMLElement> };
        const childRef = (children as ChildWithRef).ref;
        if (typeof childRef === "function") {
          childRef(node);
        } else if (childRef && typeof childRef === "object" && "current" in childRef) {
          (childRef as RefObject<HTMLElement | null>).current = node;
        }
      },
      ...triggerEvents
    } as HTMLAttributes<HTMLElement>);
  }

  return (
    <span ref={triggerRef as RefObject<HTMLSpanElement>} className={styles.wrapper} {...triggerEvents}>
      {children}
    </span>
  );
}

// 4. TOOLTIP CONTENT (Portal)
export interface TooltipContentProps extends PropsWithChildren {
  side?: "top" | "bottom" | "left" | "right";
  offset?: number;
  tooltipId?: string; // Auto-injected by <Tooltip>
}

export function TooltipContent({ children, side = "top", offset = 8, tooltipId }: TooltipContentProps) {
  const activeId = useTooltipSelector(state => state.activeId);
  const triggerRect = useTooltipSelector(state => state.triggerRect);
  const isOpen = tooltipId != null && activeId === tooltipId;

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [actualSide, setActualSide] = useState(side);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRect && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let targetSide = side;
      let x = 0;
      let y = 0;

      const spaceTop = triggerRect.top;
      const spaceBottom = window.innerHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = window.innerWidth - triggerRect.right;

      if (side === "top" && spaceTop < tooltipRect.height + offset && spaceBottom > spaceTop) {
        targetSide = "bottom";
      } else if (side === "bottom" && spaceBottom < tooltipRect.height + offset && spaceTop > spaceBottom) {
        targetSide = "top";
      } else if (side === "left" && spaceLeft < tooltipRect.width + offset && spaceRight > spaceLeft) {
        targetSide = "right";
      } else if (side === "right" && spaceRight < tooltipRect.width + offset && spaceLeft > spaceRight) {
        targetSide = "left";
      }

      setActualSide(targetSide);

      switch (targetSide) {
        case "top":
          x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          y = triggerRect.top - tooltipRect.height - offset;
          break;
        case "bottom":
          x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          y = triggerRect.bottom + offset;
          break;
        case "left":
          x = triggerRect.left - tooltipRect.width - offset;
          y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          break;
        case "right":
          x = triggerRect.right + offset;
          y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          break;
      }

      if (x < offset) x = offset;
      if (x + tooltipRect.width > window.innerWidth - offset) {
        x = window.innerWidth - tooltipRect.width - offset;
      }
      if (y < offset) y = offset;
      if (y + tooltipRect.height > window.innerHeight - offset) {
        y = window.innerHeight - tooltipRect.height - offset;
      }

      setCoords({ x, y });
      requestAnimationFrame(() => setIsVisible(true));
    } else if (!isOpen) {
      setIsVisible(false); // Fade out instantly when closing
    }
  }, [isOpen, triggerRect, side, offset]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={`${styles.tooltip} ${isVisible ? styles.visible : ""}`}
      style={{ left: coords.x, top: coords.y }}
      data-side={actualSide}
      role="tooltip"
    >
      {children}
    </div>,
    document.body
  );
}
