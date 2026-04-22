import { createContext, useContext, useState, useRef, useEffect, type PropsWithChildren, isValidElement, type ReactElement, type MouseEvent as ReactMouseEvent, type ButtonHTMLAttributes, cloneElement } from "react";
import styles from "./dropdown.module.scss";

// 1. Context to share state
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("Dropdown components must be used within a <Dropdown>");
  return context;
}

// 2. Main Wrapper (Provider + Click Outside)
interface DropdownProps extends PropsWithChildren {
  className?: string;
}

export function Dropdown({ children, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, toggle, close }}>
      <div 
        ref={containerRef} 
        className={`${styles.dropdown} ${className || ""}`}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// 3. Trigger Component
interface DropdownTriggerProps extends PropsWithChildren {
  className?: string;
  asChild?: boolean;
}

export function DropdownTrigger({ children, className, asChild }: DropdownTriggerProps) {
  const { toggle, isOpen } = useDropdown();

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
    return cloneElement(child, {
      ...child.props,
      onClick: (e: ReactMouseEvent<HTMLButtonElement>) => {
        toggle();
        if (child.props.onClick) child.props.onClick(e);
      },
      "data-state": isOpen ? "open" : "closed",
    } as ButtonHTMLAttributes<HTMLButtonElement>);
  }

  return (
    <button 
      onClick={toggle} 
      className={`${styles.trigger} ${className || ""}`}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </button>
  );
}

// 4. Menu Component (Popup)
interface DropdownMenuProps extends PropsWithChildren {
  className?: string;
  align?: "left" | "right" | "center";
}

export function DropdownMenu({ children, className, align = "left" }: DropdownMenuProps) {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  return (
    <div 
      className={`${styles.menu} ${styles[`align-${align}`]} ${className || ""}`}
      role="menu"
    >
      {children}
    </div>
  );
}

// 5. Item Component
interface DropdownItemProps extends PropsWithChildren {
  className?: string;
  onClick?: (e: ReactMouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

export function DropdownItem({ children, className, onClick, disabled }: DropdownItemProps) {
  const { close } = useDropdown();

  const handleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (onClick) onClick(e);
    close(); // Auto close on item click
  };

  return (
    <div 
      className={`${styles.item} ${disabled ? styles.disabled : ""} ${className || ""}`}
      onClick={handleClick}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
}
