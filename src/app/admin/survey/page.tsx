"use client";

import { useEffect, useState } from "react";
import {
  getMembers,
  getMeetingCandidates,
  getMeetingResponses,
  getAvailabilityResponses,
} from "@/app/actions";
import { WEEKDAYS, TIME_ZONES, MONTH_PERIODS, SEMINAR_OPTIONS } from "@/lib/supabase";

type Member = { id: string; name: string; role: string | null };
type Candidate = { id: string; label: string };
type MeetingResponse = { member_id: string; meeting_candidate_id: string };
type AvailabilityRow = {
  member_id: string;
  busy_weekdays: string[];
  busy_time_zones: string[];
  busy_month_period: string[];
  free_comment: string | null;
  seminar_wishes: { selected: string[]; other: string } | null;
  lecture_person_wish: string | null;
};

export default function AdminSurveyPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [meetingResponses, setMeetingResponses] = useState<MeetingResponse[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getMembers(),
      getMeetingCandidates(),
      getMeetingResponses(),
      getAvailabilityResponses(),
    ])
      .then(([m, c, mr, ar]) => {
        setMembers(m as Member[]);
        setCandidates(c as Candidate[]);
        setMeetingResponses((mr as MeetingResponse[]) ?? []);
        setAvailability((ar as AvailabilityRow[]) ?? []);
      })
      .catch(() => setError("データの取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? id;
  const byCandidate = new Map<string, string[]>();
  meetingResponses.forEach((r) => {
    const list = byCandidate.get(r.meeting_candidate_id) ?? [];
    list.push(memberName(r.member_id));
    byCandidate.set(r.meeting_candidate_id, list);
  });

  const busyWeekdayCounts = new Map<string, number>();
  const busyTimeZoneCounts = new Map<string, number>();
  const monthPeriodCounts = new Map<string, number>();
  const seminarCounts = new Map<string, number>();
  WEEKDAYS.forEach((d) => busyWeekdayCounts.set(d, 0));
  TIME_ZONES.forEach((z) => busyTimeZoneCounts.set(z, 0));
  MONTH_PERIODS.forEach((p) => monthPeriodCounts.set(p, 0));
  SEMINAR_OPTIONS.forEach((s) => seminarCounts.set(s, 0));
  availability.forEach((a) => {
    (a.busy_weekdays ?? []).forEach((d) => busyWeekdayCounts.set(d, (busyWeekdayCounts.get(d) ?? 0) + 1));
    (a.busy_time_zones ?? []).forEach((z) => busyTimeZoneCounts.set(z, (busyTimeZoneCounts.get(z) ?? 0) + 1));
    (a.busy_month_period ?? []).forEach((p) => monthPeriodCounts.set(p, (monthPeriodCounts.get(p) ?? 0) + 1));
    (a.seminar_wishes?.selected ?? []).forEach((s) => seminarCounts.set(s, (seminarCounts.get(s) ?? 0) + 1));
  });

  if (loading) return <p className="text-stone-500">読み込み中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">アンケート集計（初回顔合わせ・稼働）</h2>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">初回顔合わせ 参加できる日時</h3>
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <p className="text-sm text-stone-400">候補日が未設定です。「委員・候補日」で投入できます。</p>
          ) : (
            candidates.map((c) => {
              const names = byCandidate.get(c.id) ?? [];
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-stone-700 w-32">{c.label}</span>
                  <span className="text-stone-500">({names.length}名)</span>
                  <span className="text-stone-600">{names.join("、") || "—"}</span>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">参加しにくい曜日（人数）</h3>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-3 py-2 rounded-lg bg-red-50 text-red-900 text-sm">
              {d} <span className="font-semibold">{busyWeekdayCounts.get(d) ?? 0}</span>人
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">参加しにくい時間帯（人数）</h3>
        <div className="flex flex-wrap gap-2">
          {TIME_ZONES.map((z) => (
            <div key={z} className="px-3 py-2 rounded-lg bg-red-50 text-red-900 text-sm">
              {z} <span className="font-semibold">{busyTimeZoneCounts.get(z) ?? 0}</span>人
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">忙しい時期（人数）</h3>
        <div className="flex flex-wrap gap-2">
          {MONTH_PERIODS.map((p) => (
            <div key={p} className="px-3 py-2 rounded-lg bg-amber-50 text-amber-900 text-sm">
              {p} <span className="font-semibold">{monthPeriodCounts.get(p) ?? 0}</span>人
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">実施してほしいセミナー・学びたいこと（人数）</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {SEMINAR_OPTIONS.map((s) => (
            <div key={s} className="px-3 py-2 rounded-lg bg-stone-100 text-stone-700 text-sm">
              {s} <span className="font-semibold">{seminarCounts.get(s) ?? 0}</span>人
            </div>
          ))}
        </div>
        {availability.some((a) => (a.seminar_wishes?.other ?? "").trim()) && (
          <>
            <p className="text-xs text-stone-500 mb-1">その他（自由記述）</p>
            <ul className="text-sm space-y-1 text-stone-600">
              {availability
                .filter((a) => (a.seminar_wishes?.other ?? "").trim())
                .map((a) => (
                  <li key={a.member_id}>
                    <span className="font-medium">{memberName(a.member_id)}</span>: {a.seminar_wishes?.other}
                  </li>
                ))}
            </ul>
          </>
        )}
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">講義希望・コメント</h3>
        <ul className="text-sm space-y-3 text-stone-600">
          {availability
            .filter((a) => (a.lecture_person_wish ?? "").trim() || (a.free_comment ?? "").trim())
            .map((a) => (
              <li key={a.member_id} className="border-b border-stone-100 pb-2">
                <span className="font-medium text-stone-800">{memberName(a.member_id)}</span>
                {(a.lecture_person_wish ?? "").trim() && (
                  <p className="mt-1"><span className="text-stone-500">講義希望:</span> {a.lecture_person_wish}</p>
                )}
                {(a.free_comment ?? "").trim() && (
                  <p className="mt-1"><span className="text-stone-500">コメント:</span> {a.free_comment}</p>
                )}
              </li>
            ))}
        </ul>
        {!availability.some((a) => (a.lecture_person_wish ?? "").trim() || (a.free_comment ?? "").trim()) && (
          <p className="text-sm text-stone-400">まだありません</p>
        )}
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">回答者一覧</h3>
        <ul className="text-sm space-y-1 text-stone-600">
          {members.map((m) => {
            const av = availability.find((a) => a.member_id === m.id);
            const hasMeeting = meetingResponses.some((r) => r.member_id === m.id);
            return (
              <li key={m.id}>
                {m.name}
                {hasMeeting && "（顔合わせ回答済）"}
                {av && "（稼働アンケート済）"}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
