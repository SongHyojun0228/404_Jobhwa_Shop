import { createClient } from "@supabase/supabase-js";

/** 서버 컴포넌트 / Route Handler 전용 — service_role 키로 RLS 우회 */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/** 서버에서 anon 클라이언트가 필요할 때 (공개 insert 등) */
export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
