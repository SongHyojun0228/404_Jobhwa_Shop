import RetroWindow from "@/components/RetroWindow";
import LoginForm from "./LoginForm";
import AdminDashboard, { type AdminWorry } from "./AdminDashboard";
import { verifyAdmin } from "./actions";

export const dynamic = "force-dynamic";

/* ── 초록 큐브 아이콘 ── */
function GreenCube() {
  return (
    <div
      style={{
        width: 17,
        height: 17,
        background: "#2c8c3c",
        borderTop: "1.5px solid #6cc279",
        borderLeft: "1.5px solid #6cc279",
        borderRight: "1.5px solid #1b5c27",
        borderBottom: "1.5px solid #1b5c27",
      }}
    />
  );
}

async function fetchAdminData(): Promise<{
  worries: AdminWorry[];
  pickedCount: number;
}> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return { worries: [], pickedCount: 0 };
  }

  const { getSupabaseAdmin } = await import("@/lib/supabase/server");
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("worries")
    .select("*, solutions(count)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("fetchAdminData error:", error);
    return { worries: [], pickedCount: 0 };
  }

  const worries: AdminWorry[] = data.map((w: Record<string, unknown>) => ({
    id: w.id as string,
    display_type: w.display_type as string,
    display_name: w.display_name as string | null,
    age_group: w.age_group as string | null,
    job: w.job as string | null,
    content: w.content as string,
    email: w.email as string | null,
    status: w.status as string,
    created_at: w.created_at as string,
    selected_at: w.selected_at as string | null,
    published_at: w.published_at as string | null,
    closed_at: w.closed_at as string | null,
    completed_at: w.completed_at as string | null,
    solution_count:
      Array.isArray(w.solutions) && w.solutions.length > 0
        ? (w.solutions[0] as { count: number }).count
        : 0,
  }));

  // 전체 채택 수
  const { count: pickedCount } = await supabase
    .from("solutions")
    .select("*", { count: "exact", head: true })
    .eq("is_picked", true);

  return { worries, pickedCount: pickedCount ?? 0 };
}

export default async function AdminPage() {
  const authed = await verifyAdmin();

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <RetroWindow
          title="운영자 — 개발자의 잡화점"
          icon={<GreenCube />}
          statusRight={<span>🔒 관리자 전용</span>}
        >
          <LoginForm />
        </RetroWindow>
      </main>
    );
  }

  const { worries, pickedCount } = await fetchAdminData();

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <RetroWindow
        title="운영자 — 개발자의 잡화점"
        icon={<GreenCube />}
        maxWidth={800}
        statusRight={<span>🗂 {pickedCount}건 채택됨</span>}
      >
        <AdminDashboard worries={worries} pickedCount={pickedCount} />
      </RetroWindow>
    </main>
  );
}
