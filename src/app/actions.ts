"use server";

import { supabase } from "@/lib/supabase";

function getDb() {
  if (!supabase) throw new Error("Supabaseが未設定です。.env.local を確認してください。");
  return supabase;
}

export async function getMembers() {
  const { data, error } = await getDb()
    .from("members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMeetingCandidates() {
  const { data, error } = await getDb()
    .from("meeting_candidates")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** 顔合わせ候補日が0件のときだけ、初期データ（2月・3月）を投入する。SQLを叩かずに管理者画面から実行可能 */
const DEFAULT_CANDIDATES: { candidate_date: string; time_slot: null; label: string; sort_order: number }[] = [
  { candidate_date: "2026-02-10", time_slot: null, label: "2/10(火)", sort_order: 1 },
  { candidate_date: "2026-02-11", time_slot: null, label: "2/11(水祝)", sort_order: 2 },
  { candidate_date: "2026-02-12", time_slot: null, label: "2/12(木)", sort_order: 3 },
  { candidate_date: "2026-02-16", time_slot: null, label: "2/16(月)", sort_order: 4 },
  { candidate_date: "2026-02-22", time_slot: null, label: "2/22(日)", sort_order: 5 },
  { candidate_date: "2026-02-23", time_slot: null, label: "2/23(月祝)", sort_order: 6 },
  { candidate_date: "2026-02-25", time_slot: null, label: "2/25(水)", sort_order: 7 },
  { candidate_date: "2026-03-01", time_slot: null, label: "3/1(日)", sort_order: 8 },
  { candidate_date: "2026-03-05", time_slot: null, label: "3/5(木)", sort_order: 9 },
  { candidate_date: "2026-03-08", time_slot: null, label: "3/8(日)", sort_order: 10 },
  { candidate_date: "2026-03-10", time_slot: null, label: "3/10(火)", sort_order: 11 },
  { candidate_date: "2026-03-15", time_slot: null, label: "3/15(日)", sort_order: 12 },
  { candidate_date: "2026-03-16", time_slot: null, label: "3/16(月)", sort_order: 13 },
  { candidate_date: "2026-03-18", time_slot: null, label: "3/18(水)", sort_order: 14 },
  { candidate_date: "2026-03-19", time_slot: null, label: "3/19(木)", sort_order: 15 },
  { candidate_date: "2026-03-20", time_slot: null, label: "3/20(金)", sort_order: 16 },
  { candidate_date: "2026-03-21", time_slot: null, label: "3/21(土)", sort_order: 17 },
  { candidate_date: "2026-03-23", time_slot: null, label: "3/23(月)", sort_order: 18 },
];

export async function seedMeetingCandidatesIfEmpty(): Promise<
  { ok: true; message: string } | { ok: false; message: string }
> {
  const db = getDb();
  const { data: existing } = await db.from("meeting_candidates").select("id").limit(1);
  if (existing && existing.length > 0) {
    return { ok: true, message: "すでに候補日があります。追加はSupabaseの meeting_candidates で行ってください。" };
  }
  const { error } = await db.from("meeting_candidates").insert(DEFAULT_CANDIDATES);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "候補日を18件投入しました。回答ページでタップできる日が表示されます。" };
}

export async function getMeetingResponses() {
  const { data, error } = await getDb()
    .from("meeting_responses")
    .select("member_id, meeting_candidate_id");
  if (error) throw error;
  return data ?? [];
}

export async function getAvailabilityResponses() {
  const { data, error } = await getDb()
    .from("availability_responses")
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function submitMeetingResponses(
  memberId: string,
  candidateIds: string[]
) {
  const db = getDb();
  const { data: existing } = await db
    .from("meeting_responses")
    .select("id, meeting_candidate_id")
    .eq("member_id", memberId);
  const existingIds = new Set((existing ?? []).map((r) => r.meeting_candidate_id));

  const toInsert = candidateIds.filter((cid) => !existingIds.has(cid));
  const toDelete = (existing ?? []).filter((r) => !candidateIds.includes(r.meeting_candidate_id));

  if (toDelete.length) {
    await db
      .from("meeting_responses")
      .delete()
      .eq("member_id", memberId)
      .in("meeting_candidate_id", toDelete.map((r) => r.meeting_candidate_id));
  }
  if (toInsert.length) {
    await db.from("meeting_responses").insert(
      toInsert.map((meeting_candidate_id) => ({
        member_id: memberId,
        meeting_candidate_id,
        can_attend: true,
      }))
    );
  }
}

export async function submitAvailability(
  memberId: string,
  freeWeekdays: string[],
  busyWeekdays: string[],
  freeTimeZones: string[],
  busyTimeZones: string[],
  busyMonthPeriod: string[],
  freeComment: string | null,
  seminarWishes: { selected: string[]; other: string },
  lecturePersonWish: string | null
) {
  const { error } = await getDb().from("availability_responses").upsert(
    {
      member_id: memberId,
      free_weekdays: freeWeekdays,
      busy_weekdays: busyWeekdays,
      free_time_zones: freeTimeZones,
      busy_time_zones: busyTimeZones,
      busy_month_period: busyMonthPeriod,
      free_comment: freeComment || null,
      seminar_wishes: seminarWishes,
      lecture_person_wish: lecturePersonWish || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "member_id" }
  );
  if (error) throw error;
}

export async function submitAll(
  memberId: string,
  candidateIds: string[],
  freeWeekdays: string[],
  busyWeekdays: string[],
  freeTimeZones: string[],
  busyTimeZones: string[],
  busyMonthPeriod: string[],
  freeComment: string | null,
  seminarWishes: { selected: string[]; other: string },
  lecturePersonWish: string | null
) {
  await submitMeetingResponses(memberId, candidateIds);
  await submitAvailability(
    memberId,
    freeWeekdays,
    busyWeekdays,
    freeTimeZones,
    busyTimeZones,
    busyMonthPeriod,
    freeComment,
    seminarWishes,
    lecturePersonWish
  );
}

// --- スケジュール ---
export type ScheduleEvent = {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  place: string | null;
  memo: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  const { data, error } = await getDb()
    .from("schedule_events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScheduleEvent[];
}

export async function createScheduleEvent(input: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">) {
  const { error } = await getDb().from("schedule_events").insert({
    ...input,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateScheduleEvent(id: string, input: Partial<ScheduleEvent>) {
  const { error } = await getDb()
    .from("schedule_events")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteScheduleEvent(id: string) {
  const { error } = await getDb().from("schedule_events").delete().eq("id", id);
  if (error) throw error;
}

// --- 議事録 ---
export type Minute = {
  id: string;
  title: string;
  minute_date: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
};

export async function getMinutes(): Promise<Minute[]> {
  const { data, error } = await getDb()
    .from("minutes")
    .select("*")
    .order("minute_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Minute[];
}

export async function createMinute(input: Omit<Minute, "id" | "created_at" | "updated_at">) {
  const { error } = await getDb().from("minutes").insert({
    ...input,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateMinute(id: string, input: Partial<Minute>) {
  const { error } = await getDb()
    .from("minutes")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMinute(id: string) {
  const { error } = await getDb().from("minutes").delete().eq("id", id);
  if (error) throw error;
}

// --- 共有資料・連絡 ---
export type SharedMaterial = {
  id: string;
  title: string;
  kind: "notice" | "link" | "file";
  url: string | null;
  body: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function getSharedMaterials(): Promise<SharedMaterial[]> {
  const { data, error } = await getDb()
    .from("shared_materials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SharedMaterial[];
}

export async function createSharedMaterial(input: Omit<SharedMaterial, "id" | "created_at" | "updated_at">) {
  const { error } = await getDb().from("shared_materials").insert({
    ...input,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateSharedMaterial(id: string, input: Partial<SharedMaterial>) {
  const { error } = await getDb()
    .from("shared_materials")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSharedMaterial(id: string) {
  const { error } = await getDb().from("shared_materials").delete().eq("id", id);
  if (error) throw error;
}

// --- 意見・アイデア ---
export type Idea = {
  id: string;
  content: string;
  source: string | null;
  member_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function getIdeas(): Promise<Idea[]> {
  const { data, error } = await getDb()
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Idea[];
}

export async function createIdea(input: Omit<Idea, "id" | "created_at" | "updated_at">) {
  const { error } = await getDb().from("ideas").insert({
    ...input,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateIdea(id: string, input: Partial<Idea>) {
  const { error } = await getDb()
    .from("ideas")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteIdea(id: string) {
  const { error } = await getDb().from("ideas").delete().eq("id", id);
  if (error) throw error;
}
