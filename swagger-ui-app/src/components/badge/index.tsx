/* eslint-disable react-hooks/static-components */
import type { JSX, PropsWithChildren } from "react";
import { Container, type ContainerBadgeProps, type BadgeColor } from "./container";

export type { BadgeColor };

export type BadgeProps<Element extends keyof JSX.IntrinsicElements = "span"> = ContainerBadgeProps<Element> & {
  as?: Element;
}

export function Badge<Element extends keyof JSX.IntrinsicElements = "span">(props: PropsWithChildren<BadgeProps<Element>>) {
  const { as = "span", color = "gray", ...rest } = props;

  const Component = Container("Badge", as, {
    color,
  });

  return <Component {...rest as ContainerBadgeProps<"span">} />
}
