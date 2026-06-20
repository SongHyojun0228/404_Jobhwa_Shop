"use client";

import { useState, useId, type TextareaHTMLAttributes } from "react";

type LinedPaperTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style" | "onChange"
> & {
  maxLength: number;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function LinedPaperTextarea({
  maxLength,
  label,
  className = "",
  id: externalId,
  onChange,
  ...rest
}: LinedPaperTextareaProps) {
  const [count, setCount] = useState(0);
  const autoId = useId();
  const id = externalId || autoId;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <label
          htmlFor={id}
          style={{ fontWeight: 600, fontSize: 12.5, color: "#2a2722" }}
        >
          {label}
        </label>
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: "#8a8474",
          }}
        >
          {count} / {maxLength}
        </div>
      </div>
      <textarea
        id={id}
        maxLength={maxLength}
        className={`lined-paper-bg ${className}`}
        style={{
          width: "100%",
          padding: "0 14px 12px 42px",
          fontFamily: "'Gaegu', cursive",
          fontSize: 17,
          lineHeight: "28px",
          resize: "none",
          color: "#2a2722",
          borderTop: "2px solid #8f897a",
          borderLeft: "2px solid #8f897a",
          borderRight: "2px solid #f1ede2",
          borderBottom: "2px solid #f1ede2",
          outline: "none",
        }}
        onChange={(e) => {
          setCount(e.target.value.length);
          onChange?.(e);
        }}
        {...rest}
      />
    </div>
  );
}
