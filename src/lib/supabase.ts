import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function createSupabase(): SupabaseClient | null {
  if (supabaseUrl && supabaseAnonKey) return createClient(supabaseUrl, supabaseAnonKey);
  return null;
}

export const supabase = createSupabase();

export type Member = {
  id: string;
  name: string;
  role: string | null;
  sort_order: number;
  created_at: string;
};

export type MeetingCandidate = {
  id: string;
  candidate_date: string;
  time_slot: string | null;
  label: string;
  sort_order: number;
  created_at: string;
};

export type MeetingResponse = {
  id: string;
  member_id: string;
  meeting_candidate_id: string;
  can_attend: boolean;
  created_at: string;
};

export type AvailabilityResponse = {
  id: string;
  member_id: string;
  free_weekdays: string[];
  busy_weekdays: string[];
  free_time_zones: string[];
  busy_time_zones: string[];
  busy_month_period: string[];
  free_comment: string | null;
  seminar_wishes: { selected: string[]; other: string } | null;
  lecture_person_wish: string | null;
  created_at: string;
  updated_at: string;
};

export const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"] as const;
// 午前・昼・夕方 + 18時以降は1時間単位
export const TIME_ZONES = [
  "午前（〜12時）",
  "昼（12〜15時）",
  "夕方（15〜18時）",
  "18時",
  "19時",
  "20時",
  "21時",
  "22時",
  "23時",
] as const;
// 忙しい時期を細かく（毎月の日程調整用）
export const MONTH_PERIODS = [
  "1〜3日",
  "4〜7日",
  "8〜10日",
  "11〜15日",
  "16〜20日",
  "21〜25日",
  "26〜28日",
  "29〜31日",
] as const;
// 実施してほしいセミナー・学びたいこと（具体的な選択肢）
export const SEMINAR_OPTIONS = [
  "経営戦略",
  "財務・資金繰り",
  "融資・借入",
  "補助金",
  "採用",
  "人材育成",
  "DX戦略",
  "AI活用",
  "マーケティング・集客",
  "営業・販売",
  "法律・契約",
  "広報・SNS",
  "その他",
] as const;
