import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://icftwzoysfxgxcozfuwj.supabase.co";

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_ANON_KEY && typeof window !== "undefined") {
  // 클라이언트에서 anon key 없으면 명확히 알려주기
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다. .env.local 또는 Vercel 설정을 확인하세요."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }, // 로그인 안 씀
  realtime: { params: { eventsPerSecond: 10 } },
});

// ──────────────────────────────────────────────────────────────
// 타입 정의 (DB 스키마와 일치)
// ──────────────────────────────────────────────────────────────
export type MessageStatus =
  | "draft"
  | "pending"
  | "feedback"
  | "revised"
  | "fixed"
  | "excluded";

export interface Message {
  id: string;
  rank: number;
  customer_id: string;
  tail4: string;
  name_guess: string | null;
  field: string;
  period: string | null;
  total_score: number | null;
  recency_score: number | null;
  richness_score: number | null;
  potential_score: number | null;
  body_len: number | null;
  raw_text: string | null;
  raw_excerpt: string | null;
  source_file: string | null;
  status: MessageStatus;
  current_version: number;
  fixed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageVersion {
  id: string;
  message_id: string;
  version_num: number;
  body_text: string;
  author_name: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  message_id: string;
  author_name: string | null;
  body: string;
  replied_to_version: number | null;
  created_at: string;
}
