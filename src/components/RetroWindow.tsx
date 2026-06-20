import type { ReactNode } from "react";

type RetroWindowProps = {
  title: string;
  icon?: ReactNode;
  awningColor?: string;
  children?: ReactNode;
  toolbar?: ReactNode;
  statusLeft?: string;
  statusRight?: ReactNode;
  maxWidth?: number;
};

export default function RetroWindow({
  title,
  icon,
  awningColor = "#1f5048",
  children,
  toolbar,
  statusLeft = "© 개발자의 잡화점",
  statusRight,
  maxWidth = 392,
}: RetroWindowProps) {
  return (
    <div
      className="w-full mx-auto"
      style={{
        maxWidth,
        background: "#ddd6c4",
        borderTop: "2px solid #f1ede2",
        borderLeft: "2px solid #f1ede2",
        borderRight: "2px solid #8f897a",
        borderBottom: "2px solid #8f897a",
        boxShadow: "7px 7px 0 rgba(15,28,25,.22)",
      }}
    >
      {/* ── 차양(awning) ── */}
      <div
        className="awning-mask"
        style={{
          background: `repeating-linear-gradient(90deg, ${awningColor} 0 14px, #e8dfca 14px 28px)`,
        }}
      />

      {/* ── 타이틀바 ── */}
      <div
        className="flex items-center gap-2"
        style={{ background: "#1f5048", padding: "6px 7px" }}
      >
        {/* 아이콘 */}
        {icon ?? (
          <div
            style={{
              width: 17,
              height: 17,
              background: "#ffcd00",
              borderTop: "1.5px solid #ffe27a",
              borderLeft: "1.5px solid #ffe27a",
              borderRight: "1.5px solid #a87f00",
              borderBottom: "1.5px solid #a87f00",
            }}
          />
        )}
        {/* 제목 */}
        <div
          className="flex-1 truncate"
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
          }}
        >
          {title}
        </div>
        {/* _  ×  버튼 */}
        <div className="flex gap-1">
          {["_", "×"].map((label) => (
            <div
              key={label}
              style={{
                width: 18,
                height: 17,
                background: "#d8d3c4",
                borderTop: "1.5px solid #f1ede2",
                borderLeft: "1.5px solid #f1ede2",
                borderRight: "1.5px solid #8f897a",
                borderBottom: "1.5px solid #8f897a",
                fontSize: 11,
                textAlign: "center",
                lineHeight: "13px",
                color: "#2a2722",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── 툴바 (메뉴바 등) ── */}
      {toolbar}

      {/* ── 본체 ── */}
      <div>{children}</div>

      {/* ── 상태바 ── */}
      <div
        className="flex justify-between items-center"
        style={{
          padding: "5px 11px",
          background: "#cfc9ba",
          borderTop: "2px solid #8f897a",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: "#6f6a5e",
        }}
      >
        <span>{statusLeft}</span>
        {statusRight && <span>{statusRight}</span>}
      </div>
    </div>
  );
}
