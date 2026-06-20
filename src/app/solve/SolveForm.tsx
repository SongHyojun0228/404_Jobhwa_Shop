"use client";

import { useState, useId } from "react";
import { submitSolution } from "./actions";
import LinedPaperTextarea from "@/components/LinedPaperTextarea";
import RetroButton from "@/components/RetroButton";

type DisplayType = "anonymous" | "nickname" | "initials";

export type WorryData = {
  id: string;
  display_type: string;
  display_name: string | null;
  age_group: string | null;
  job: string | null;
  content: string;
  worryNumber: number;
};

const sunkenInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 11px",
  fontSize: 14,
  background: "#fffdf6",
  borderTop: "2px solid #8f897a",
  borderLeft: "2px solid #8f897a",
  borderRight: "2px solid #f1ede2",
  borderBottom: "2px solid #f1ede2",
  outline: "none",
  minHeight: 44,
};

function formatSender(type: string, name: string | null): string {
  if (type === "nickname") return `@${name}`;
  if (type === "initials") return name || "익명";
  return "익명";
}

function summarize(text: string, max = 20): string {
  const firstLine = text.replace(/\n/g, " ").trim();
  return firstLine.length > max ? firstLine.slice(0, max) + "…" : firstLine;
}

/* ── 성공 화면 ── */
function SuccessView() {
  return (
    <div style={{ padding: "32px 18px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">
        ✉
      </div>
      <p
        style={{
          fontFamily: "'Jua', sans-serif",
          fontSize: 22,
          color: "#2a2722",
          lineHeight: 1.4,
          margin: "0 0 10px",
        }}
      >
        편지가 잘 전달됐어요
      </p>
      <p style={{ fontSize: 13, color: "#6f6a5e", margin: 0 }}>
        보낸 편지는 운영자가 정리해 SNS에 올려요.
      </p>
    </div>
  );
}

/* ── 메인 폼 ── */
export default function SolveForm({ worry }: { worry: WorryData }) {
  const [displayType, setDisplayType] = useState<DisplayType>("anonymous");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputId = useId();

  if (submitted) {
    return <SuccessView />;
  }

  const senderName = formatSender(worry.display_type, worry.display_name);
  const toLine = [
    senderName,
    worry.job,
  ]
    .filter(Boolean)
    .join(" · ");

  const chipLabels: { value: DisplayType; label: string }[] = [
    { value: "anonymous", label: "익명" },
    { value: "nickname", label: "닉네임" },
    { value: "initials", label: "초성" },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("worryId", worry.id);
    formData.set("displayType", displayType);

    if (
      displayType !== "anonymous" &&
      !formData.get("displayName")?.toString().trim()
    ) {
      setError("표시 이름을 입력해주세요.");
      setSubmitting(false);
      return;
    }
    if (!formData.get("content")?.toString().trim()) {
      setError("편지 내용을 입력해주세요.");
      setSubmitting(false);
      return;
    }

    const result = await submitSolution(formData);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ padding: "14px 18px 16px" }}>
        {/* ── From / To 헤더 ── */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: "#4a463c",
            lineHeight: 1.9,
            paddingBottom: 10,
            borderBottom: "1px dashed #b3ad9d",
          }}
        >
          <div>
            From&nbsp;:{" "}
            <span style={{ color: "#1f5048" }}>나의 처방</span>
          </div>
          <div>
            To&nbsp;&nbsp;&nbsp;:{" "}
            <span style={{ color: "#b5562f" }}>{toLine}</span>
          </div>
          <div>
            RE&nbsp;&nbsp;&nbsp;: No.{worry.worryNumber} —{" "}
            {summarize(worry.content)}
          </div>
        </div>

        {/* ── 고민 원문 (sunken + lined paper, 읽기 전용) ── */}
        <div
          style={{
            marginTop: 12,
            background: "#fffdf6",
            borderTop: "2px solid #8f897a",
            borderLeft: "2px solid #8f897a",
            borderRight: "2px solid #f1ede2",
            borderBottom: "2px solid #f1ede2",
          }}
        >
          <div
            className="lined-paper-bg"
            style={{
              fontFamily: "'Gaegu', cursive",
              fontSize: 17,
              color: "#2a2722",
              lineHeight: "28px",
              padding: "7px 14px 12px 42px",
            }}
          >
            {worry.content}
          </div>
        </div>

        {/* ── 구분선 "℞ 나의 처방" ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "18px 0 16px",
          }}
          aria-hidden="true"
        >
          <div style={{ flex: 1, height: 1, background: "#b3ad9d" }} />
          <div
            style={{
              fontFamily: "'Jua', sans-serif",
              fontSize: 14,
              color: "#b5562f",
              whiteSpace: "nowrap",
            }}
          >
            ℞ 나의 처방
          </div>
          <div style={{ flex: 1, height: 1, background: "#b3ad9d" }} />
        </div>

        {/* ── 표시 방법 ── */}
        <fieldset
          style={{ border: "none", margin: 0, padding: 0 }}
        >
          <legend
            style={{
              fontWeight: 600,
              fontSize: 12.5,
              color: "#2a2722",
              marginBottom: 8,
              padding: 0,
            }}
          >
            어떻게 표시할까요?
          </legend>
          <div
            role="radiogroup"
            aria-label="표시 방법"
            style={{ display: "flex", gap: 8 }}
          >
            {chipLabels.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={displayType === value}
                onClick={() => setDisplayType(value)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  minHeight: 44,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Sans KR', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#2a2722",
                  background:
                    displayType === value ? "#ffd95c" : "#e4dfd2",
                  borderTop: "2px solid #f1ede2",
                  borderLeft: "2px solid #f1ede2",
                  borderRight: "2px solid #8f897a",
                  borderBottom: "2px solid #8f897a",
                  boxShadow: "2px 2px 0 rgba(15,28,25,.16)",
                  borderRadius: 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {displayType !== "anonymous" && (
            <div style={{ marginTop: 8 }}>
              <label htmlFor={nameInputId} className="sr-only">
                {displayType === "initials" ? "초성" : "닉네임"}
              </label>
              <input
                id={nameInputId}
                type="text"
                name="displayName"
                maxLength={20}
                required
                placeholder={
                  displayType === "initials"
                    ? "초성 (예: ㄱㄴㄷ)"
                    : "닉네임 (20자 이내)"
                }
                style={sunkenInput}
              />
            </div>
          )}
        </fieldset>

        {/* ── 해결편지 ── */}
        <div style={{ marginTop: 14 }}>
          <LinedPaperTextarea
            label="해결편지"
            name="content"
            maxLength={1000}
            rows={6}
            required
            placeholder="보낼 수는 없겠지만, 당신께 편지를 씁니다…"
          />
        </div>

        {/* ── 에러 ── */}
        {error && (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "#fff3c4",
              borderTop: "2px solid #8f897a",
              borderLeft: "2px solid #8f897a",
              borderRight: "2px solid #f1ede2",
              borderBottom: "2px solid #f1ede2",
              fontSize: 12.5,
              color: "#6b5800",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* ── 보내기 버튼 (우측 정렬) ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <RetroButton
            type="submit"
            variant="terracotta"
            disabled={submitting}
            aria-busy={submitting}
            style={{
              padding: "11px 30px",
              fontSize: 16,
              whiteSpace: "nowrap",
            }}
          >
            {submitting ? "보내는 중…" : "✉ 보내기"}
          </RetroButton>
        </div>
        <p
          style={{
            textAlign: "right",
            fontSize: 11,
            color: "#8a8474",
            marginTop: 8,
          }}
        >
          보낸 편지는 운영자가 정리해 SNS에 올려요.
        </p>
      </div>
    </form>
  );
}
