"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/* ── 타입 ── */
export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export type Solution = {
  id: string;
  worry_id: string;
  display_type: string;
  display_name: string | null;
  content: string;
  is_picked: boolean;
  created_at: string;
};

/* ── 인증 헬퍼 ── */
function getSessionToken(): string {
  return createHash("sha256")
    .update((process.env.ADMIN_PASSWORD || "") + "_jabhwajeom")
    .digest("hex");
}

export async function verifyAdmin(): Promise<boolean> {
  const jar = await cookies();
  return jar.get("admin_session")?.value === getSessionToken();
}

function authFail(): ActionResult {
  return { success: false, error: "인증이 필요합니다." };
}

/* ── 로그인/로그아웃 ── */
export async function adminLogin(
  formData: FormData,
): Promise<ActionResult> {
  const password = formData.get("password") as string;

  if (!process.env.ADMIN_PASSWORD) {
    return { success: false, error: "ADMIN_PASSWORD 환경변수가 설정되지 않았어요." };
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: "비밀번호가 틀렸어요." };
  }

  const jar = await cookies();
  jar.set("admin_session", getSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminLogout(): Promise<void> {
  const jar = await cookies();
  jar.delete("admin_session");
  revalidatePath("/admin");
}

/* ── 상태 전환 ── */
const TIMESTAMP_FIELD: Record<string, string> = {
  selected: "selected_at",
  published: "published_at",
  closed: "closed_at",
  completed: "completed_at",
};

export async function transitionWorry(
  worryId: string,
  toStatus: string,
): Promise<ActionResult> {
  if (!(await verifyAdmin())) return authFail();

  const supabase = getSupabaseAdmin();

  // published 전환 시: 이미 게시중인 고민이 있는지 체크
  if (toStatus === "published") {
    const { data: existing } = await supabase
      .from("worries")
      .select("id")
      .eq("status", "published")
      .limit(1);

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "동시에 게시중인 고민이 이미 있어요. 먼저 마감해주세요.",
      };
    }
  }

  const tsField = TIMESTAMP_FIELD[toStatus];
  const update: Record<string, unknown> = { status: toStatus };
  if (tsField) update[tsField] = new Date().toISOString();

  const { error } = await supabase
    .from("worries")
    .update(update)
    .eq("id", worryId);

  if (error) {
    console.error("transitionWorry error:", error);
    return { success: false, error: "상태 변경에 실패했어요." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function revertToPending(
  worryId: string,
): Promise<ActionResult> {
  if (!(await verifyAdmin())) return authFail();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("worries")
    .update({ status: "pending", selected_at: null })
    .eq("id", worryId)
    .eq("status", "selected");

  if (error) {
    console.error("revertToPending error:", error);
    return { success: false, error: "되돌리기에 실패했어요." };
  }

  revalidatePath("/admin");
  return { success: true };
}

/* ── 삭제 ── */
export async function deleteWorry(
  worryId: string,
): Promise<ActionResult> {
  if (!(await verifyAdmin())) return authFail();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("worries")
    .delete()
    .eq("id", worryId);

  if (error) {
    console.error("deleteWorry error:", error);
    return { success: false, error: "삭제에 실패했어요." };
  }

  revalidatePath("/admin");
  return { success: true };
}

/* ── 편지 채택 토글 ── */
export async function toggleSolutionPick(
  solutionId: string,
  picked: boolean,
): Promise<ActionResult> {
  if (!(await verifyAdmin())) return authFail();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("solutions")
    .update({ is_picked: picked })
    .eq("id", solutionId);

  if (error) {
    console.error("toggleSolutionPick error:", error);
    return { success: false, error: "채택 변경에 실패했어요." };
  }

  revalidatePath("/admin");
  return { success: true };
}

/* ── 편지 목록 조회 ── */
export async function fetchSolutions(
  worryId: string,
): Promise<Solution[]> {
  if (!(await verifyAdmin())) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("solutions")
    .select("*")
    .eq("worry_id", worryId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchSolutions error:", error);
    return [];
  }

  return (data as Solution[]) || [];
}
