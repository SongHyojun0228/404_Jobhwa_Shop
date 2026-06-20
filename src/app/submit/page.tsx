import RetroWindow from "@/components/RetroWindow";
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";

async function getWorryCount(): Promise<number> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return 0;
  }
  const { getSupabaseAdmin } = await import("@/lib/supabase/server");
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("worries")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function SubmitPage() {
  const worryCount = await getWorryCount();
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <RetroWindow
        title="고민접수 — 개발자의 잡화점"
        statusRight={<span>🏪 영업중 · 24h</span>}
        toolbar={
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "4px 11px",
              borderBottom: "1px solid #b3ad9d",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#4a463c",
            }}
            aria-hidden="true"
          >
            <span>
              <u>파</u>일
            </span>
            <span>
              <u>편</u>집
            </span>
            <span>
              <u>보</u>기
            </span>
            <span>도움말</span>
          </div>
        }
      >
        <SubmitForm worryNumber={worryCount + 1} />
      </RetroWindow>
    </main>
  );
}
