import type { SVGProps } from "react";

export const iconNames = [
  "dashboard",
  "people",
  "student",
  "guardian",
  "tutor",
  "sessions",
  "calendar",
  "message",
  "whatsapp",
  "invoice",
  "payment",
  "receipt",
  "export",
  "settings",
  "team",
  "search",
  "plus",
  "edit",
  "check",
  "alert",
  "lock",
  "eye",
  "link",
  "upload",
  "download",
  "arrow-left",
  "arrow-right",
  "chevron-down",
  "close",
  "menu",
  "more",
] as const;

export type IconName = (typeof iconNames)[number];

type IconProps = Omit<SVGProps<SVGSVGElement>, "aria-hidden" | "children"> & {
  name: IconName;
  size?: number;
  label?: string;
};

export function Icon({ name, size = 18, label, ...props }: IconProps) {
  return (
    <svg
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      focusable="false"
    >
      <use href={`/images/line-art/icons.svg#${name}`} />
    </svg>
  );
}