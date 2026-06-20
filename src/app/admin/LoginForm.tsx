"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "./actions";
import RetroButton from "@/components/RetroButton";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordId = useId();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);
    setLoading(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ padding: "28px 18px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }} aria-hidden="true">
          🔒
        </div>
        <p
          style={{
            fontFamily: "'Jua', sans-serif",
            fontSize: 20,
            color: "#2a2722",
            margin: "0 0 4px",
          }}
        >
          잡화점 운영실
        </p>
        <p style={{ fontSize: 12.5, color: "#6f6a5e", margin: "0 0 20px" }}>
          비밀번호를 입력해주세요.
        </p>

        <div style={{ maxWidth: 260, margin: "0 auto" }}>
          <label
            htmlFor={passwordId}
            className="sr-only"
          >
            관리자 비밀번호
          </label>
          <input
            id={passwordId}
            type="password"
            name="password"
            required
            autoFocus
            placeholder="비밀번호"
            style={{
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
              textAlign: "center",
            }}
          />

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 10,
                padding: "8px 10px",
                background: "#fff3c4",
                borderTop: "2px solid #8f897a",
                borderLeft: "2px solid #8f897a",
                borderRight: "2px solid #f1ede2",
                borderBottom: "2px solid #f1ede2",
                fontSize: 12,
                color: "#6b5800",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <RetroButton
            type="submit"
            variant="yellow"
            disabled={loading}
            aria-busy={loading}
            style={{ width: "100%", marginTop: 12, fontSize: 15, padding: 11 }}
          >
            {loading ? "확인 중…" : "입장하기"}
          </RetroButton>
        </div>
      </div>
    </form>
  );
}
