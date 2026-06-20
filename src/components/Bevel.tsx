import type { ReactNode } from "react";

type BevelProps = {
  variant?: "raised" | "sunken";
  children?: ReactNode;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  style?: React.CSSProperties;
};

const bevelStyles = {
  raised: {
    borderTop: "2px solid #f1ede2",
    borderLeft: "2px solid #f1ede2",
    borderRight: "2px solid #8f897a",
    borderBottom: "2px solid #8f897a",
  },
  sunken: {
    borderTop: "2px solid #8f897a",
    borderLeft: "2px solid #8f897a",
    borderRight: "2px solid #f1ede2",
    borderBottom: "2px solid #f1ede2",
  },
} as const;

export default function Bevel({
  variant = "raised",
  children,
  className = "",
  as: Tag = "div",
  style,
}: BevelProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component
      className={className}
      style={{ ...bevelStyles[variant], ...style }}
    >
      {children}
    </Component>
  );
}
