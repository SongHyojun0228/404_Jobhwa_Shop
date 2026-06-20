import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "yellow" | "terracotta" | "green" | "plain";

type RetroButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantStyles: Record<
  Variant,
  { bg: string; hi: string; lo: string; color: string }
> = {
  yellow: {
    bg: "#ffd95c",
    hi: "#ffe9a6",
    lo: "#c79a14",
    color: "#2a2722",
  },
  terracotta: {
    bg: "#b5562f",
    hi: "#d98a64",
    lo: "#7d3618",
    color: "#ffffff",
  },
  green: {
    bg: "#2c8c3c",
    hi: "#6cc279",
    lo: "#1b5c27",
    color: "#ffffff",
  },
  plain: {
    bg: "#e4dfd2",
    hi: "#f1ede2",
    lo: "#8f897a",
    color: "#2a2722",
  },
};

export default function RetroButton({
  variant = "yellow",
  children,
  className = "",
  style,
  ...rest
}: RetroButtonProps) {
  const v = variantStyles[variant];
  return (
    <button
      className={className}
      style={{
        cursor: "pointer",
        fontFamily: "'Jua', sans-serif",
        fontSize: 17,
        padding: "13px 24px",
        color: v.color,
        background: v.bg,
        borderTop: `2px solid ${v.hi}`,
        borderLeft: `2px solid ${v.hi}`,
        borderRight: `2px solid ${v.lo}`,
        borderBottom: `2px solid ${v.lo}`,
        boxShadow: "3px 3px 0 rgba(15,28,25,.22)",
        borderRadius: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
