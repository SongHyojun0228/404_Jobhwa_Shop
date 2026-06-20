import RetroWindow from "@/components/RetroWindow";
import SolveForm, { type WorryData } from "./SolveForm";

export const dynamic = "force-dynamic";

/* ── 봉투 아이콘 (CSS 도형) ── */
function EnvelopeIcon() {
  return (
    <div
      style={{
        width: 19,
        height: 15,
        background: "#fffdf6",
        border: "1.5px solid #2a2722",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "#ffd95c",
          clipPath: "polygon(0 0, 50% 75%, 100% 0)",
        }}
      />
    </div>
  );
}

/* ── 빈 상태 ── */
function EmptyState() {
  return (
    <div style={{ padding: "40px 18px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 14 }} aria-hidden="true">
        📭
      </div>
      <p
        style={{
          fontFamily: "'Jua', sans-serif",
          fontSize: 20,
          color: "#2a2722",
          lineHeight: 1.4,
          margin: "0 0 8px",
        }}
      >
        지금은 받고 있는 고민이 없어요
      </p>
      <p style={{ fontSize: 13, color: "#6f6a5e", margin: 0, lineHeight: 1.6 }}>
        다음 회차를 기다려주세요.
      </p>
    </div>
  );
}

async function getPublishedWorry(): Promise<{
  worry: WorryData | null;
}> {
  // Supabase 미설정 시 빈 상태
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return { worry: null };
  }

  const { getSupabaseAdmin } = await import("@/lib/supabase/server");
  const supabase = getSupabaseAdmin();

  const { data: worry, error } = await supabase
    .from("worries")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !worry) {
    return { worry: null };
  }

  // 회차 번호: 이 고민 이전(포함)에 생성된 전체 고민 수
  const { count } = await supabase
    .from("worries")
    .select("*", { count: "exact", head: true })
    .lte("created_at", worry.created_at);

  return {
    worry: {
      id: worry.id,
      display_type: worry.display_type,
      display_name: worry.display_name,
      age_group: worry.age_group,
      job: worry.job,
      content: worry.content,
      worryNumber: count ?? 1,
    },
  };
}

export default async function SolvePage() {
  const { worry } = await getPublishedWorry();

  const title = worry
    ? `처방전 쓰기 — No.${worry.worryNumber}`
    : "처방전 쓰기 — 개발자의 잡화점";

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <RetroWindow
        title={title}
        awningColor="#b5562f"
        icon={<EnvelopeIcon />}
        statusRight={
          <span>{worry ? "📮 편지 수신중" : "📭 대기중"}</span>
        }
      >
        {worry ? <SolveForm worry={worry} /> : <EmptyState />}
      </RetroWindow>
    </main>
  );
}
