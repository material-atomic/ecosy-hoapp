import { createElement, type ComponentProps, type JSX } from "react";
import styles from "./button-icon.module.scss";

export type ContainerIconProps<Element extends keyof JSX.IntrinsicElements> = ComponentProps<Element> & {
  size?: 7 | 8 | 9 | 10;
  variant?: "solid" | "ghost";
}

export function Container<Element extends keyof JSX.IntrinsicElements>(name: string, component: Element, initialProps: ContainerIconProps<Element>) {
  function ContainerIcon(props: ContainerIconProps<Element>) {
    const {
      size: initialSize,
      variant: initialVariant,
      className: initialClassName,
      ...restInitial
    } = initialProps;
    const {
      size = initialSize,
      variant = initialVariant,
      className = initialClassName,
      ...restProps
    } = props;
    const finalProps = Object.assign({}, restInitial, restProps);

    return createElement(component, {
      ...finalProps,
      className: `${styles.button} ${styles[`size-${size}`]} ${styles[variant]} ${className}`,
    });
  }

  ContainerIcon.displayName = name;
  return ContainerIcon;
}
