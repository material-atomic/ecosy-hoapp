/* eslint-disable react-hooks/refs */
import React, { createContext, useContext, useEffect, useRef, type PropsWithChildren } from "react";
import { createStore, type PayloadAction } from "@ecosy/store";
import { createStoreOrder } from "@ecosy/react";
import styles from "./resizable.module.scss";

export interface ResizableState {
  orientation: "vertical" | "horizontal";
}

function createStorable(initialState: ResizableState) {
  return createStore({
    initialState,
    reducers: {
      setOrientation(state, action: PayloadAction<"vertical" | "horizontal">) {
        state.orientation = action.payload;
      }
    },
  });
}

type Storable = ReturnType<typeof createStorable>;

const ResizableContext = createContext<Storable>(undefined);

interface ResizableProviderProps {
  storable: Storable;
}

function useResizable() {
  const context = useContext(ResizableContext);

  if (!context) {
    throw new Error("useResizable using within component ResizableProvider");
  }

  return {
    store: context.store,
    actions: context.actions,
  };
}

function useSelector<Selected>(selector: (state: ResizableState) => Selected) {
  const { store } = useResizable();
  return createStoreOrder(store)(selector);
}

function ResizableProvider(props: PropsWithChildren<ResizableProviderProps>) {
  return (
    <ResizableContext.Provider value={props.storable} children={props.children} />
  );
}

export interface ResizableProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function Resizable(props: PropsWithChildren<ResizableProps>) {
  const {
   orientation = "vertical",
   className,
   children 
  } = props;

  // React 18 / Fast Refresh safe initialization
  const storeRef = useRef<ReturnType<typeof createStorable> | null>(null);
  
  if (!storeRef.current) {
    storeRef.current = createStorable({
      orientation,
    });
  }

  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.actions.setOrientation(orientation);
    }
  }, [orientation]);

  return (
    <ResizableProvider storable={storeRef.current}>
      <div className={`${styles.container} ${styles[orientation]} ${className || ""}`}>
        {children}
      </div>
    </ResizableProvider>
  );
}

export interface ResizablePaneProps {
  minSize?: number | string;
  maxSize?: number | string;
  defaultSize?: number | string;
  className?: string;
}

export function ResizablePane(props: PropsWithChildren<ResizablePaneProps>) {
  const { minSize, maxSize, defaultSize, className, children } = props;
  const orientation = useSelector(state => state.orientation);
  const isVerticalSplit = orientation === "vertical"; // vertical split = left/right blocks

  return (
    <div 
      className={`${styles.pane} ${className || ""}`}
      data-min-size={minSize}
      data-max-size={maxSize}
      style={{
        flexBasis: defaultSize || 'auto',
        flexGrow: defaultSize ? 0 : 1,
        // Let CSS enforce bounds dynamically based on actual split orientation
        minWidth: isVerticalSplit ? minSize : undefined,
        maxWidth: isVerticalSplit ? maxSize : undefined,
        minHeight: !isVerticalSplit ? minSize : undefined,
        maxHeight: !isVerticalSplit ? maxSize : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function ResizableHandler(props: { className?: string }) {
  const orientation = useSelector(state => state.orientation);
  const isVerticalSplit = orientation === "vertical"; // vertical split = left/right blocks

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handler = e.currentTarget as HTMLDivElement;
    const prevPane = handler.previousElementSibling as HTMLElement;
    const nextPane = handler.nextElementSibling as HTMLElement;
    const parentContainer = handler.parentElement;

    if (!prevPane || !nextPane || !parentContainer) return;

    // We take over flex layouts during drag by assigning explicit sizes
    const prevRect = prevPane.getBoundingClientRect();
    const nextRect = nextPane.getBoundingClientRect();
    const parentScale = isVerticalSplit ? parentContainer.clientWidth : parentContainer.clientHeight;
    
    // Initial size snapshot
    const prevStartSize = isVerticalSplit ? prevRect.width : prevRect.height;
    const nextStartSize = isVerticalSplit ? nextRect.width : nextRect.height;
    const startMouse = isVerticalSplit ? e.clientX : e.clientY;

    // Use existing flex behaviors (grow/shrink) set by React.
    // By only mutating flexBasis, we ensure window resizing allows flex panes to scale naturally.
    if (isVerticalSplit) {
      prevPane.style.flexBasis = `${prevStartSize}px`;
      nextPane.style.flexBasis = `${nextStartSize}px`;
    } else {
      prevPane.style.flexBasis = `${prevStartSize}px`;
      nextPane.style.flexBasis = `${nextStartSize}px`;
    }

    // Read and parse constraints accurately via parent context sizes
    const parseConstraint = (val: string | null | undefined): number | null => {
      if (!val) return null;
      if (val.endsWith("%")) {
        return (parseFloat(val) / 100) * parentScale;
      }
      return parseFloat(val);
    };

    const pMin = parseConstraint(prevPane.dataset.minSize);
    const pMax = parseConstraint(prevPane.dataset.maxSize);
    const nMin = parseConstraint(nextPane.dataset.minSize);
    const nMax = parseConstraint(nextPane.dataset.maxSize);

    const onPointerMove = (moveEv: PointerEvent) => {
      let delta = (isVerticalSplit ? moveEv.clientX : moveEv.clientY) - startMouse;

      let newPrevSize = prevStartSize + delta;
      let newNextSize = nextStartSize - delta;

      // Ensure boundaries
      if (pMin !== null && newPrevSize < pMin) { delta = pMin - prevStartSize; }
      if (pMax !== null && newPrevSize > pMax) { delta = pMax - prevStartSize; }
      if (nMin !== null && (nextStartSize - delta) < nMin) { delta = nextStartSize - nMin; }
      if (nMax !== null && (nextStartSize - delta) > nMax) { delta = nextStartSize - nMax; }

      // Final bounded adjustments
      newPrevSize = prevStartSize + delta;
      newNextSize = nextStartSize - delta;

      // Direct DOM flexBasis mutation: allows CSS flexbox to resume responsibility afterwards
      prevPane.style.flexBasis = `${newPrevSize}px`;
      nextPane.style.flexBasis = `${newNextSize}px`;
    };

    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.body.style.cursor = "";
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.body.style.cursor = isVerticalSplit ? "col-resize" : "row-resize";
  };

  return (
    <div 
      className={`${styles.handler} ${styles[orientation]} ${props.className || ""}`} 
      onPointerDown={handlePointerDown} 
    />
  );
}
