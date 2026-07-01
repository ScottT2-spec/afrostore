import type { CSSProperties } from "react";

export function resolveOpacity(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value > 1 ? value / 100 : value;
}

export function getSectionStyle(props: Record<string, unknown>) {
  const backgroundImage = props.bgImage as string | undefined;
  const bgColor = (props.bgColor as string) || undefined;
  const textColor = (props.textColor as string) || undefined;

  return {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: backgroundImage ? "cover" : undefined,
    backgroundPosition: backgroundImage ? "center center" : undefined,
    backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
    backgroundColor: bgColor,
    color: textColor,
  } as CSSProperties;
}
