import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://icftwzoysfxgxcozfuwj.supabase.co";

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// 빌드 시점에는 키가 없어도 createClient가 throw 하지 않도록 placeholder 사용.
// 런타임에 실제 키 없으면 API 호출이 실패하고 컴포넌트의 try/catch가 에러 UI 표시.
const KEY_FOR_CLIENT =
  SUPABASE_ANON_KEY || "build-time-placeholder-no-real-requests-will-succeed";

export const hasSupabaseKey = SUPABASE_ANON_KEY.length > 0;

if (!hasSupabaseKey && typeof window !== "undefined") {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다. .env.local 또는 Vercel 설정을 확인하세요."
  );
}

export const supabase = createClient(SUPABASE_URL, KEY_FOR_CLIENT, {
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
