import { Container, type ContainerIconProps } from "./container";

export type ButtonIconProps = ContainerIconProps<"button">;
export type SpanIconProps = ContainerIconProps<"span">;

export const ButtonIcon = Container("ButtonIcon", "button", {
  type: "button",
  variant: "ghost",
  size: 7
});

export const SpanIcon = Container("ButtonIcon", "span", {
  variant: "ghost",
  size: 7
});
