"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import RetroButton from "@/components/RetroButton";
import {
  transitionWorry,
  revertToPending,
  deleteWorry,
  toggleSolutionPick,
  fetchSolutions,
  adminLogout,
  type Solution,
} from "./actions";

/* ── 타입 ── */
type Status = "pending" | "selected" | "published" | "closed" | "completed";

export type AdminWorry = {
  id: string;
  display_type: string;
  display_name: string | null;
  age_group: string | null;
  job: string | null;
  content: string;
  email: string | null;
  status: string;
  created_at: string;
  selected_at: string | null;
  published_at: string | null;
  closed_at: string | null;
  completed_at: string | null;
  solution_count: number;
};

type Props = {
  worries: AdminWorry[];
  pickedCount: number;
};

/* ── 상수 ── */
const STATUSES: Status[] = [
  "pending",
  "selected",
  "published",
  "closed",
  "completed",
];
const STATUS_LABELS: Record<Status, string> = {
  pending: "대기중",
  selected: "선정됨",
  published: "게시됨",
  closed: "마감",
  completed: "완료",
};

/* ── 헬퍼 ── */
function formatDate(d: string): string {
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}.${pad(dt.getMonth() + 1)}.${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function displayName(w: AdminWorry): string {
  if (w.display_type === "nickname") return `@${w.display_name}`;
  if (w.display_type === "initials") return w.display_name || "익명";
  return "익명";
}

function senderLabel(s: Solution): string {
  if (s.display_type === "nickname") return `@${s.display_name}`;
  if (s.display_type === "initials") return s.display_name || "익명";
  return "익명";
}

/* ── 스타일 상수 ── */
const chipBase: React.CSSProperties = {
  padding: "7px 14px",
  minHeight: 36,
  cursor: "pointer",
  fontFamily: "'IBM Plex Mono', monospace",
  fontWeight: 600,
  fontSize: 11,
  color: "#2a2722",
  borderTop: "2px solid #f1ede2",
  borderLeft: "2px solid #f1ede2",
  borderRight: "2px solid #8f897a",
  borderBottom: "2px solid #8f897a",
  borderRadius: 0,
};

const cardStyle: React.CSSProperties = {
  padding: "14px",
  background: "#fffdf6",
  borderTop: "2px solid #f1ede2",
  borderLeft: "2px solid #f1ede2",
  borderRight: "2px solid #8f897a",
  borderBottom: "2px solid #8f897a",
  marginBottom: 10,
};

const smallBtn: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 12,
  fontFamily: "'IBM Plex Sans KR', sans-serif",
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: 0,
};

/* ──────────────────────────────────────────────
   삭제 확인 모달
   ────────────────────────────────────────────── */
function ConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#ddd6c4",
          padding: "20px 24px",
          borderTop: "2px solid #f1ede2",
          borderLeft: "2px solid #f1ede2",
          borderRight: "2px solid #8f897a",
          borderBottom: "2px solid #8f897a",
          boxShadow: "7px 7px 0 rgba(15,28,25,.22)",
          maxWidth: 320,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontFamily: "'Jua', sans-serif",
            fontSize: 16,
            color: "#2a2722",
            margin: "0 0 6px",
          }}
        >
          정말 삭제할까요?
        </p>
        <p style={{ fontSize: 12, color: "#6f6a5e", margin: "0 0 16px" }}>
          이 고민과 달린 편지가 모두 삭제됩니다. 되돌릴 수 없어요.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <RetroButton
            variant="plain"
            onClick={onCancel}
            style={{ padding: "7px 16px", fontSize: 13 }}
          >
            취소
          </RetroButton>
          <RetroButton
            variant="terracotta"
            onClick={onConfirm}
            style={{ padding: "7px 16px", fontSize: 13 }}
          >
            삭제
          </RetroButton>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   편지 상세 뷰 (마감/완료 탭)
   ────────────────────────────────────────────── */
function WorryDetailView({
  worry,
  readOnly,
  onBack,
  onAction,
}: {
  worry: AdminWorry;
  readOnly: boolean;
  onBack: () => void;
  onAction: (msg: string) => void;
}) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "picked">("all");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSolutions(worry.id).then((s) => {
      setSolutions(s);
      setLoading(false);
    });
  }, [worry.id]);

  const visible =
    filter === "picked" ? solutions.filter((s) => s.is_picked) : solutions;
  const pickedN = solutions.filter((s) => s.is_picked).length;

  async function handleToggle(sol: Solution) {
    const next = !sol.is_picked;
    // 낙관적 업데이트
    setSolutions((prev) =>
      prev.map((s) => (s.id === sol.id ? { ...s, is_picked: next } : s)),
    );
    const result = await toggleSolutionPick(sol.id, next);
    if (!result.success) {
      // 롤백
      setSolutions((prev) =>
        prev.map((s) => (s.id === sol.id ? { ...s, is_picked: !next } : s)),
      );
      onAction(result.error);
    }
  }

  async function handleCopy() {
    const picked = solutions.filter((s) => s.is_picked);
    const text = picked
      .map((s, i) => `[${i + 1}] ${senderLabel(s)}\n${s.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard 미지원 */
    }
  }

  async function handleComplete() {
    setBusy(true);
    const result = await transitionWorry(worry.id, "completed");
    setBusy(false);
    if (result.success) {
      router.refresh();
      onBack();
    } else {
      onAction(result.error);
    }
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        style={{
          ...smallBtn,
          background: "#e4dfd2",
          border: "none",
          marginBottom: 10,
          color: "#6f6a5e",
        }}
      >
        ← 목록으로
      </button>

      {/* 고민 원문 */}
      <div
        style={{
          background: "#fffdf6",
          borderTop: "2px solid #8f897a",
          borderLeft: "2px solid #8f897a",
          borderRight: "2px solid #f1ede2",
          borderBottom: "2px solid #f1ede2",
          marginBottom: 14,
        }}
      >
        <div style={{ padding: "8px 12px 4px", borderBottom: "1px dashed #d8ccb2" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#6f6a5e",
            }}
          >
            {displayName(worry)}
            {worry.age_group ? ` · ${worry.age_group}` : ""}
            {worry.job ? ` · ${worry.job}` : ""}
          </span>
        </div>
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

      {/* 툴바 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              ...chipBase,
              background: filter === "all" ? "#ffd95c" : "#e4dfd2",
            }}
          >
            전체 {solutions.length}
          </button>
          <button
            onClick={() => setFilter("picked")}
            style={{
              ...chipBase,
              background: filter === "picked" ? "#ffd95c" : "#e4dfd2",
            }}
          >
            채택 {pickedN}
          </button>
        </div>
        <button
          onClick={handleCopy}
          style={{
            ...chipBase,
            background: "#e4dfd2",
          }}
        >
          {copied ? "✓ 복사됨" : "⧉ 전체 복사"}
        </button>
      </div>

      {/* 편지 목록 */}
      {loading ? (
        <p style={{ fontSize: 12, color: "#8a8474", textAlign: "center", padding: 20 }}>
          불러오는 중…
        </p>
      ) : visible.length === 0 ? (
        <p style={{ fontSize: 12, color: "#8a8474", textAlign: "center", padding: 20 }}>
          {filter === "picked" ? "채택된 편지가 없어요." : "아직 도착한 편지가 없어요."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((sol, i) => (
            <div
              key={sol.id}
              style={{
                background: "#fffdf6",
                padding: 13,
                borderTop: "2px solid #f1ede2",
                borderLeft: "2px solid #f1ede2",
                borderRight: "2px solid #8f897a",
                borderBottom: "2px solid #8f897a",
                boxShadow: sol.is_picked
                  ? "3px 3px 0 rgba(31,80,72,.30)"
                  : "2px 2px 0 rgba(15,28,25,.10)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {!readOnly && (
                  <button
                    onClick={() => handleToggle(sol)}
                    aria-label={sol.is_picked ? "채택 해제" : "채택"}
                    style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#2a2722",
                      lineHeight: 1,
                      background: sol.is_picked ? "#ffd95c" : "#fffdf6",
                      borderTop: "2px solid #8f897a",
                      borderLeft: "2px solid #8f897a",
                      borderRight: "2px solid #f1ede2",
                      borderBottom: "2px solid #f1ede2",
                      padding: 0,
                      borderRadius: 0,
                    }}
                  >
                    {sol.is_picked ? "✓" : ""}
                  </button>
                )}
                {readOnly && sol.is_picked && (
                  <span style={{ fontSize: 14 }}>✓</span>
                )}
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4a463c",
                  }}
                >
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#2a2722" }}
                >
                  {senderLabel(sol)}
                </span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px dashed #cfc9b6",
                  fontFamily: "'Gaegu', cursive",
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: "#2a2722",
                  whiteSpace: "pre-wrap",
                }}
              >
                {sol.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 완료 처리 버튼 (마감 탭 전용) */}
      {!readOnly && (
        <RetroButton
          variant="green"
          onClick={handleComplete}
          disabled={busy}
          aria-busy={busy}
          style={{ width: "100%", marginTop: 14, fontSize: 16, padding: 12 }}
        >
          {busy ? "처리 중…" : "✓ 완료 처리 (해결법 게시 후)"}
        </RetroButton>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   메인 대시보드
   ────────────────────────────────────────────── */
export default function AdminDashboard({ worries, pickedCount }: Props) {
  const [tab, setTab] = useState<Status>("pending");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailWorryId, setDetailWorryId] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const counts: Record<Status, number> = {
    pending: 0,
    selected: 0,
    published: 0,
    closed: 0,
    completed: 0,
  };
  for (const w of worries) {
    if (w.status in counts) counts[w.status as Status]++;
  }

  const filtered = worries.filter((w) => w.status === tab);

  async function handleTransition(id: string, to: string) {
    setActionBusy(id);
    const result = await transitionWorry(id, to);
    setActionBusy(null);
    if (result.success) {
      router.refresh();
    } else {
      showToast(result.error);
    }
  }

  async function handleRevert(id: string) {
    setActionBusy(id);
    const result = await revertToPending(id);
    setActionBusy(null);
    if (result.success) {
      router.refresh();
    } else {
      showToast(result.error);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteWorry(deleteTarget);
    setDeleteTarget(null);
    if (result.success) {
      if (detailWorryId === deleteTarget) setDetailWorryId(null);
      router.refresh();
    } else {
      showToast(result.error);
    }
  }

  async function handleLogout() {
    await adminLogout();
    router.refresh();
  }

  // 마감/완료 탭에서 상세 뷰 열림
  const detailWorry =
    detailWorryId ? worries.find((w) => w.id === detailWorryId) : null;
  const showDetail =
    detailWorry && (tab === "closed" || tab === "completed");

  return (
    <div style={{ padding: "10px 14px 14px" }}>
      {/* ── 헤더 ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'Jua', sans-serif",
            fontSize: 18,
            color: "#2a2722",
          }}
        >
          잡화점 운영실
        </span>
        <button
          onClick={handleLogout}
          style={{
            ...smallBtn,
            background: "transparent",
            border: "none",
            color: "#8a8474",
            fontSize: 11,
          }}
        >
          로그아웃
        </button>
      </div>

      {/* ── 탭 바 ── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setTab(s);
              setDetailWorryId(null);
            }}
            style={{
              ...chipBase,
              background: tab === s ? "#ffd95c" : "#e4dfd2",
              boxShadow: "2px 2px 0 rgba(15,28,25,.16)",
            }}
          >
            {STATUS_LABELS[s]}({counts[s]})
          </button>
        ))}
      </div>

      {/* ── 토스트 ── */}
      {toast && (
        <div
          role="alert"
          style={{
            padding: "8px 12px",
            marginBottom: 10,
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
          {toast}
        </div>
      )}

      {/* ── 상세 뷰 (마감/완료) ── */}
      {showDetail && detailWorry ? (
        <WorryDetailView
          worry={detailWorry}
          readOnly={tab === "completed"}
          onBack={() => setDetailWorryId(null)}
          onAction={showToast}
        />
      ) : filtered.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            padding: 24,
            fontSize: 13,
            color: "#8a8474",
          }}
        >
          {STATUS_LABELS[tab]} 상태의 고민이 없어요.
        </p>
      ) : (
        /* ── 목록 뷰 ── */
        <div>
          {filtered.map((w) => (
            <div
              key={w.id}
              style={{
                ...cardStyle,
                cursor:
                  tab === "closed" || tab === "completed"
                    ? "pointer"
                    : "default",
              }}
              onClick={
                tab === "closed" || tab === "completed"
                  ? () => setDetailWorryId(w.id)
                  : undefined
              }
            >
              {/* 메타 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "#8a8474",
                  }}
                >
                  {formatDate(w.created_at)}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#4a463c",
                  }}
                >
                  {displayName(w)}
                  {w.age_group ? ` · ${w.age_group}` : ""}
                  {w.job ? ` · ${w.job}` : ""}
                </span>
              </div>

              {/* 본문 */}
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#2a2722",
                  margin: "0 0 10px",
                  whiteSpace: "pre-wrap",
                  maxHeight: 120,
                  overflow: "hidden",
                }}
              >
                {w.content}
              </p>

              {/* 게시됨 탭 전용: 편지 수 */}
              {tab === "published" && (
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "#1f5048",
                    fontWeight: 600,
                    margin: "0 0 8px",
                  }}
                >
                  ✉ 해결편지 {w.solution_count}건 도착
                </p>
              )}

              {/* 마감/완료 탭: 클릭 안내 */}
              {(tab === "closed" || tab === "completed") && (
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: "#a39c8b",
                    margin: "0 0 8px",
                  }}
                >
                  ▸ 클릭하여 편지 {w.solution_count}건 보기
                </p>
              )}

              {/* 액션 버튼 */}
              <div
                style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 대기중 */}
                {tab === "pending" && (
                  <RetroButton
                    variant="yellow"
                    onClick={() => handleTransition(w.id, "selected")}
                    disabled={actionBusy === w.id}
                    style={{ ...smallBtn, fontFamily: "'Jua', sans-serif" }}
                  >
                    선정하기
                  </RetroButton>
                )}

                {/* 선정됨 */}
                {tab === "selected" && (
                  <>
                    <RetroButton
                      variant="yellow"
                      onClick={() => handleTransition(w.id, "published")}
                      disabled={actionBusy === w.id}
                      style={{ ...smallBtn, fontFamily: "'Jua', sans-serif" }}
                    >
                      게시 완료
                    </RetroButton>
                    <RetroButton
                      variant="plain"
                      onClick={() => handleRevert(w.id)}
                      disabled={actionBusy === w.id}
                      style={{ ...smallBtn, fontFamily: "'Jua', sans-serif" }}
                    >
                      대기중으로
                    </RetroButton>
                  </>
                )}

                {/* 게시됨 */}
                {tab === "published" && (
                  <RetroButton
                    variant="terracotta"
                    onClick={() => handleTransition(w.id, "closed")}
                    disabled={actionBusy === w.id}
                    style={{ ...smallBtn, fontFamily: "'Jua', sans-serif" }}
                  >
                    마감
                  </RetroButton>
                )}

                {/* 공통: 삭제 */}
                <RetroButton
                  variant="plain"
                  onClick={() => setDeleteTarget(w.id)}
                  style={{
                    ...smallBtn,
                    fontFamily: "'Jua', sans-serif",
                    color: "#b5562f",
                  }}
                >
                  삭제
                </RetroButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
