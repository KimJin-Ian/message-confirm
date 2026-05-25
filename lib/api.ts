"use client";

import { supabase, type Message, type MessageVersion, type Comment, type MessageStatus } from "./supabase";

// ──────────────────────────────────────────────────────────────
// 1) Messages
// ──────────────────────────────────────────────────────────────
export async function fetchAllMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("rank", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function fetchMessage(id: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Message) ?? null;
}

export async function fetchMessageByRank(rank: number): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("rank", rank)
    .maybeSingle();
  if (error) throw error;
  return (data as Message) ?? null;
}

export async function updateMessageStatus(
  id: string,
  next: MessageStatus
): Promise<void> {
  const patch: Partial<Message> = { status: next };
  if (next === "fixed") {
    patch.fixed_at = new Date().toISOString();
  }
  const { error } = await supabase.from("messages").update(patch).eq("id", id);
  if (error) throw error;
}

/** 픽스됐거나 제외된 케이스를 다시 검토 대상(pending)으로 되돌림. fixed_at도 null로 초기화. */
export async function reactivateMessage(id: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ status: "pending", fixed_at: null })
    .eq("id", id);
  if (error) throw error;
}

// ──────────────────────────────────────────────────────────────
// 2) Versions
// ──────────────────────────────────────────────────────────────
export async function fetchVersions(messageId: string): Promise<MessageVersion[]> {
  const { data, error } = await supabase
    .from("message_versions")
    .select("*")
    .eq("message_id", messageId)
    .order("version_num", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MessageVersion[];
}

export async function saveNewVersion(
  messageId: string,
  bodyText: string,
  authorName: string | null
): Promise<MessageVersion> {
  // 현재 최신 버전 번호 + 1
  const { data: latest } = await supabase
    .from("message_versions")
    .select("version_num")
    .eq("message_id", messageId)
    .order("version_num", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version_num ?? 0) + 1;

  const { data, error } = await supabase
    .from("message_versions")
    .insert({
      message_id: messageId,
      version_num: nextVersion,
      body_text: bodyText,
      author_name: authorName,
    })
    .select()
    .single();
  if (error) throw error;

  // messages.current_version & status 갱신
  await supabase
    .from("messages")
    .update({ current_version: nextVersion, status: "revised" })
    .eq("id", messageId);

  return data as MessageVersion;
}

// ──────────────────────────────────────────────────────────────
// 3) Comments
// ──────────────────────────────────────────────────────────────
export async function fetchComments(messageId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}

export async function postComment(
  messageId: string,
  body: string,
  authorName: string | null,
  repliedToVersion: number | null
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      message_id: messageId,
      body,
      author_name: authorName,
      replied_to_version: repliedToVersion,
    })
    .select()
    .single();
  if (error) throw error;

  // 코멘트가 달리면 status를 feedback으로 (revised 상태에서만)
  await supabase
    .from("messages")
    .update({ status: "feedback" })
    .eq("id", messageId)
    .in("status", ["pending", "revised"]);

  return data as Comment;
}

// ──────────────────────────────────────────────────────────────
// 4) KPI 집계 (홈 화면)
// ──────────────────────────────────────────────────────────────
export interface KpiCounts {
  total: number;
  fixed: number;
  revised: number;
  feedback: number;
  pending: number;
  excluded: number;
  draft: number;
}

export async function fetchKpiCounts(): Promise<KpiCounts> {
  const { data, error } = await supabase
    .from("messages")
    .select("status");
  if (error) throw error;
  const counts: KpiCounts = {
    total: 0,
    fixed: 0,
    revised: 0,
    feedback: 0,
    pending: 0,
    excluded: 0,
    draft: 0,
  };
  for (const row of data ?? []) {
    counts.total++;
    const s = row.status as keyof KpiCounts;
    if (s in counts) counts[s]++;
  }
  return counts;
}

// ──────────────────────────────────────────────────────────────
// 5) Realtime 구독
// ──────────────────────────────────────────────────────────────
export function subscribeToMessages(onChange: () => void) {
  const channel = supabase
    .channel("messages-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToMessage(messageId: string, onChange: () => void) {
  const channel = supabase
    .channel(`message-${messageId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "message_versions", filter: `message_id=eq.${messageId}` },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments", filter: `message_id=eq.${messageId}` },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages", filter: `id=eq.${messageId}` },
      onChange
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
