"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

export type SubmitResult =
  | { success: true }
  | { success: false; error: string };

export async function submitWorry(formData: FormData): Promise<SubmitResult> {
  const displayType = formData.get("displayType") as string;
  const displayName = formData.get("displayName") as string | null;
  const ageGroup = formData.get("ageGroup") as string | null;
  const job = formData.get("job") as string | null;
  const content = formData.get("content") as string;
  const email = formData.get("email") as string | null;

  // --- validation ---
  if (!["anonymous", "nickname", "initials"].includes(displayType)) {
    return { success: false, error: "표시 방법을 선택해주세요." };
  }

  if (
    displayType !== "anonymous" &&
    (!displayName || displayName.trim().length === 0)
  ) {
    return { success: false, error: "표시 이름을 입력해주세요." };
  }

  if (displayName && displayName.trim().length > 20) {
    return { success: false, error: "표시 이름은 20자 이내로 작성해주세요." };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, error: "고민 내용을 입력해주세요." };
  }

  if (content.length > 2000) {
    return { success: false, error: "고민은 2000자 이내로 작성해주세요." };
  }

  if (job && job.trim().length > 50) {
    return { success: false, error: "직업/신분은 50자 이내로 작성해주세요." };
  }

  if (email && email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { success: false, error: "이메일 형식을 확인해주세요." };
    }
  }

  // --- insert ---
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
    const { error } = await supabase.from("worries").insert({
      display_type: displayType,
      display_name:
        displayType === "anonymous" ? null : displayName!.trim(),
      age_group: ageGroup?.trim() || null,
      job: job?.trim() || null,
      content: content.trim(),
      email: email?.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        success: false,
        error: "제출 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      };
    }
  } catch (e) {
    console.error("Submit error:", e);
    return {
      success: false,
      error: "서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.",
    };
  }

  return { success: true };
}
