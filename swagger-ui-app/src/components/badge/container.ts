import { createElement, type ComponentProps, type JSX } from "react";
import styles from "./badge.module.scss";

export type BadgeColor = "blue" | "green" | "orange" | "red" | "purple" | "gray";

export type ContainerBadgeProps<Element extends keyof JSX.IntrinsicElements> = ComponentProps<Element> & {
  color?: BadgeColor;
}

export function Container<Element extends keyof JSX.IntrinsicElements>(name: string, component: Element, initialProps: ContainerBadgeProps<Element>) {
  function ContainerBadge(props: ContainerBadgeProps<Element>) {
    const {
      color: initialColor,
      className: initialClassName = "",
      ...restInitial
    } = initialProps;
    
    const {
      color = initialColor,
      className = initialClassName,
      ...restProps
    } = props;
    
    const finalProps = Object.assign({}, restInitial, restProps);

    return createElement(component, {
      ...finalProps,
      className: `${styles.badge} ${color ? styles[color] : ""} ${className}`.trim(),
    });
  }

  ContainerBadge.displayName = name;
  return ContainerBadge;
}
