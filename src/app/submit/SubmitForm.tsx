"use client";

import { useState, useId } from "react";
import { submitWorry } from "./actions";
import LinedPaperTextarea from "@/components/LinedPaperTextarea";
import RetroButton from "@/components/RetroButton";

type DisplayType = "anonymous" | "nickname" | "initials";

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

/* ── 우유통 CSS 도형 ── */
function MilkBoxIcon() {
  return (
    <div
      style={{ position: "relative", width: 30, height: 36, flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* 뚜껑 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 3,
          width: 24,
          height: 7,
          background: "#7f9a93",
          borderTop: "2px solid #aabfb8",
          borderLeft: "2px solid #aabfb8",
          borderRight: "2px solid #566962",
          borderBottom: "1px solid #566962",
          borderRadius: "3px 3px 0 0",
        }}
      />
      {/* 몸통 */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 0,
          width: 30,
          height: 30,
          background: "#8fa8a1",
          borderTop: "2px solid #b4c8c2",
          borderLeft: "2px solid #b4c8c2",
          borderRight: "2px solid #54665f",
          borderBottom: "2px solid #54665f",
          borderRadius: "0 0 3px 3px",
        }}
      >
        {/* 투입 슬롯 */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            right: 6,
            height: 4,
            background: "#2f3b37",
            borderRadius: 2,
          }}
        />
        {/* 라벨 */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 7,
            letterSpacing: 1,
            color: "#2f3b37",
          }}
        >
          우유
        </div>
      </div>
    </div>
  );
}

/* ── 성공 화면 ── */
function SuccessView({ hadEmail }: { hadEmail: boolean }) {
  return (
    <div style={{ padding: "32px 18px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">
        📮
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
        고민이 잘 도착했어요
      </p>
      {hadEmail && (
        <p style={{ fontSize: 13, color: "#6f6a5e", margin: "0 0 6px" }}>
          선정되면 이메일로 알려드릴게요.
        </p>
      )}
      <p style={{ fontSize: 11, color: "#8a8474", marginTop: 16 }}>
        넣은 뒤에는 익명성을 위해 다시 꺼내볼 수 없어요.
      </p>
    </div>
  );
}

/* ── 메인 폼 ── */
export default function SubmitForm({ worryNumber }: { worryNumber: number }) {
  const [displayType, setDisplayType] = useState<DisplayType>("anonymous");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hadEmail, setHadEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputId = useId();
  const ageId = useId();
  const jobId = useId();
  const emailId = useId();

  if (submitted) {
    return <SuccessView hadEmail={hadEmail} />;
  }

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
    formData.set("displayType", displayType);

    // client-side required check
    if (
      displayType !== "anonymous" &&
      !formData.get("displayName")?.toString().trim()
    ) {
      setError("표시 이름을 입력해주세요.");
      setSubmitting(false);
      return;
    }
    if (!formData.get("content")?.toString().trim()) {
      setError("고민 내용을 입력해주세요.");
      setSubmitting(false);
      return;
    }

    const emailVal = formData.get("email")?.toString().trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setError("이메일 형식을 확인해주세요.");
      setSubmitting(false);
      return;
    }

    setHadEmail(!!emailVal);

    const result = await submitWorry(formData);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ padding: "18px 18px 16px" }}>
        {/* 키커 */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "#b5562f",
          }}
        >
          No.{worryNumber} 접수중
        </div>

        {/* 제목 */}
        <h1
          style={{
            fontFamily: "'Jua', sans-serif",
            fontSize: 26,
            color: "#2a2722",
            lineHeight: 1.3,
            marginTop: 4,
            marginBottom: 0,
            fontWeight: 400,
          }}
        >
          오늘의 고민을
          <br />
          맡기고 가세요
        </h1>

        {/* 서브카피 */}
        <p
          style={{
            fontSize: 12.5,
            color: "#6f6a5e",
            marginTop: 7,
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          우유통에 살며시 넣어두고 가세요. 선정되면 익명으로 게시되고, 누군가의
          처방이 도착합니다.
        </p>

        {/* 주의 박스 */}
        <div
          role="note"
          style={{
            display: "flex",
            gap: 9,
            marginTop: 15,
            padding: "11px 12px",
            background: "#fff3c4",
            borderTop: "2px solid #8f897a",
            borderLeft: "2px solid #8f897a",
            borderRight: "2px solid #f1ede2",
            borderBottom: "2px solid #f1ede2",
          }}
        >
          <div style={{ fontSize: 14 }} aria-hidden="true">
            ⚠
          </div>
          <div
            style={{ fontSize: 11.5, lineHeight: 1.55, color: "#6b5800" }}
          >
            본인·타인을 특정할 수 있는{" "}
            <b>실명, 연락처, 회사명, SNS 아이디</b>는 적지 말아주세요. 익명이라
            더 솔직해질 수 있어요.
          </div>
        </div>

        {/* ── 표시 방법 ── */}
        <fieldset
          style={{ border: "none", margin: 0, padding: 0, marginTop: 18 }}
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

          {/* 닉네임/초성 입력 */}
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

        {/* ── 나이대 + 직업 ── */}
        <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor={ageId}
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 12.5,
                color: "#2a2722",
                marginBottom: 8,
              }}
            >
              나이대{" "}
              <span style={{ color: "#a39c8b", fontWeight: 400 }}>
                (선택)
              </span>
            </label>
            <input
              id={ageId}
              type="text"
              name="ageGroup"
              placeholder="예: 20대 후반"
              style={sunkenInput}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              htmlFor={jobId}
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 12.5,
                color: "#2a2722",
                marginBottom: 8,
              }}
            >
              직업/신분{" "}
              <span style={{ color: "#a39c8b", fontWeight: 400 }}>
                (선택)
              </span>
            </label>
            <input
              id={jobId}
              type="text"
              name="job"
              maxLength={50}
              placeholder="예: 3년차 백엔드"
              style={sunkenInput}
            />
          </div>
        </div>

        {/* ── 고민 내용 ── */}
        <div style={{ marginTop: 14 }}>
          <LinedPaperTextarea
            label="고민 내용"
            name="content"
            maxLength={2000}
            rows={6}
            required
            placeholder="요즘 가장 무겁게 짊어지고 있는 고민을 편하게 적어주세요."
          />
        </div>

        {/* ── 이메일 ── */}
        <div style={{ marginTop: 14 }}>
          <label
            htmlFor={emailId}
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: 12.5,
              color: "#2a2722",
              marginBottom: 8,
            }}
          >
            이메일{" "}
            <span style={{ color: "#a39c8b", fontWeight: 400 }}>
              (선택)
            </span>
          </label>
          <input
            id={emailId}
            type="email"
            name="email"
            placeholder="you@example.com"
            style={sunkenInput}
          />
          <p style={{ fontSize: 11, color: "#8a8474", marginTop: 6 }}>
            선정 알림에만 쓰고 게시물엔 절대 노출되지 않아요.
          </p>
        </div>

        {/* ── 우유통 모티프 ── */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "11px 13px",
            background: "#eef0e6",
            borderTop: "2px solid #8f897a",
            borderLeft: "2px solid #8f897a",
            borderRight: "2px solid #f1ede2",
            borderBottom: "2px solid #f1ede2",
          }}
        >
          <MilkBoxIcon />
          <p style={{ fontSize: 12, color: "#4f635c", lineHeight: 1.55, margin: 0 }}>
            다 쓴 편지는 가게 옆{" "}
            <b style={{ color: "#1f5048" }}>우유통</b>에 살짝 넣어두면 돼요.
            운영자만 조용히 꺼내 읽습니다.
          </p>
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

        {/* ── 제출 버튼 ── */}
        <RetroButton
          type="submit"
          variant="yellow"
          disabled={submitting}
          aria-busy={submitting}
          style={{ width: "100%", marginTop: 12, fontSize: 17, padding: 13 }}
        >
          {submitting ? "보내는 중…" : "우유통에 넣기 ▸"}
        </RetroButton>
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#8a8474",
            marginTop: 9,
          }}
        >
          넣은 뒤에는 익명성을 위해 다시 꺼내볼 수 없어요.
        </p>
      </div>
    </form>
  );
}
