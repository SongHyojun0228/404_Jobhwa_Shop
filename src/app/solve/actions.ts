"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

export type SolveResult =
  | { success: true }
  | { success: false; error: string };

export async function submitSolution(
  formData: FormData,
): Promise<SolveResult> {
  const worryId = formData.get("worryId") as string;
  const displayType = formData.get("displayType") as string;
  const displayName = formData.get("displayName") as string | null;
  const content = formData.get("content") as string;

  // --- validation ---
  if (!worryId) {
    return { success: false, error: "잘못된 요청입니다." };
  }

  if (!["anonymous", "nickname", "initials"].includes(displayType)) {
    return { success: false, error: "표시 방법을 선택해주세요." };
  }

  if (
    displayType !== "anonymous" &&
    (!displayName || !displayName.trim())
  ) {
    return { success: false, error: "표시 이름을 입력해주세요." };
  }

  if (displayName && displayName.trim().length > 20) {
    return { success: false, error: "표시 이름은 20자 이내로 작성해주세요." };
  }

  if (!content || !content.trim()) {
    return { success: false, error: "편지 내용을 입력해주세요." };
  }

  if (content.length > 1000) {
    return { success: false, error: "편지는 1000자 이내로 작성해주세요." };
  }

  // --- race condition check + insert ---
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      success: false,
      error: "서버 환경변수가 설정되지 않았어요. 관리자에게 문의해주세요.",
    };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: worry } = await supabase
      .from("worries")
      .select("status")
      .eq("id", worryId)
      .single();

    if (!worry || worry.status !== "published") {
      return {
        success: false,
        error: "방금 이 회차가 마감됐어요. 다음 회차를 기다려주세요.",
      };
    }

    const { error } = await supabase.from("solutions").insert({
      worry_id: worryId,
      display_type: displayType,
      display_name:
        displayType === "anonymous" ? null : displayName!.trim(),
      content: content.trim(),
      is_picked: false,
    });

    if (error) {
      console.error("Solution insert error:", error);
      return {
        success: false,
        error: "제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      };
    }
  } catch (e) {
    console.error("Solution submit error:", e);
    return {
      success: false,
      error: "서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.",
    };
  }

  return { success: true };
}
