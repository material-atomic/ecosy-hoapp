import { createElement, type SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> {
  size?: number;
  color?: string;
  viewBox?: number;
}

type IconChildren = [name: string, props: Record<string, unknown>];

export function createIcon(name: string, children: IconChildren[], initialProps: IconProps = {}) {
  function SvgIcon(props: IconProps) {
    const finalProps = Object.assign({}, initialProps, props);
    const { size = 24, width, height, color, strokeWidth = 2, viewBox = 24 } = finalProps;

    const svgProps = {
      ...finalProps,
      xmlns: props.xmlns ?? "http://www.w3.org/2000/svg",
      fill: props.fill ?? "none",
      strokeLinecap: props.strokeLinecap ?? "round",
      strokeLinejoin: props.strokeLinejoin ?? "round",
      viewBox: `0 0 ${viewBox} ${viewBox}`,
      stroke: color ?? "currentColor",
      strokeWidth,
      width: width ?? size,
      height: height ?? size,
      children: children.map((item, index) =>
        createElement(item[0], {...item[1], key: `${item[0]}-${index}`}))
    };

    return createElement("svg", svgProps);
  }

  SvgIcon.displayName = name;
  return SvgIcon;
}
