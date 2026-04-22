import type { ComponentProps, PropsWithChildren } from "react";
import styles from "./button.module.scss";

export type ButtonProps = ComponentProps<"button"> & {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "solid";
};

export function Button({ 
  size = "md", 
  variant = "ghost", 
  className = "", 
  children, 
  ...props 
}: PropsWithChildren<ButtonProps>) {
  return (
    <button 
      {...props}
      type={props.type || "button"}
      className={`${styles.button} ${styles[size]} ${styles[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
