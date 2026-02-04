"use client";

import { useEffect, useState } from "react";
import {
  getMembers,
  getMeetingCandidates,
  getMeetingResponses,
  getAvailabilityResponses,
  submitMeetingResponses,
  submitAvailability,
} from "@/app/actions";
import { WEEKDAYS, TIME_ZONES, MONTH_PERIODS, SEMINAR_OPTIONS } from "@/lib/supabase";

type Member = { id: string; name: string };
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

function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition ${
        selected ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      }`}
    >
      {label}
    </button>
  );
}

export default function SurveyResponsesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [meetingResponses, setMeetingResponses] = useState<MeetingResponse[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([getMembers(), getMeetingCandidates(), getMeetingResponses(), getAvailabilityResponses()])
      .then(([m, c, mr, ar]) => {
        setMembers(m as Member[]);
        setCandidates(c as Candidate[]);
        setMeetingResponses((mr as MeetingResponse[]) ?? []);
        setAvailability((ar as AvailabilityRow[]) ?? []);
      })
      .catch(() => setError("データの取得に失敗しました。"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? id;
  const candidateLabelById = (id: string) => candidates.find((c) => c.id === id)?.label ?? id;
  const meetingLabelsByMember = new Map<string, string[]>();
  meetingResponses.forEach((r) => {
    const list = meetingLabelsByMember.get(r.member_id) ?? [];
    list.push(candidateLabelById(r.meeting_candidate_id));
    meetingLabelsByMember.set(r.member_id, list);
  });

  const respondents = members.filter(
    (m) => meetingResponses.some((r) => r.member_id === m.id) || availability.some((a) => a.member_id === m.id)
  );

  if (loading) return <p className="text-stone-500">読み込み中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const av = editMemberId ? availability.find((a) => a.member_id === editMemberId) : null;
  const selectedCandidateIds = editMemberId
    ? new Set(meetingResponses.filter((r) => r.member_id === editMemberId).map((r) => r.meeting_candidate_id))
    : new Set<string>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-stone-800">回答一覧・修正</h2>
      <p className="text-sm text-stone-500">委員ごとの回答を確認し、誤りがあれば「修正」から編集して保存できます。</p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        {members.map((m) => {
          const meetingLabels = meetingLabelsByMember.get(m.id) ?? [];
          const a = availability.find((x) => x.member_id === m.id);
          const hasAny = meetingLabels.length > 0 || a;
          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-stone-200 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-stone-800">{m.name}</p>
                <p className="text-sm text-stone-500">
                  {hasAny
                    ? `顔合わせ: ${meetingLabels.length ? meetingLabels.join("、") : "—"}${a ? " / 稼働回答済" : ""}`
                    : "未回答"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditMemberId(m.id)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
              >
                修正
              </button>
            </div>
          );
        })}
      </div>

      {/* 編集モーダル */}
      {editMemberId && (
        <EditModal
          memberName={memberName(editMemberId)}
          candidates={candidates}
          initialCandidateIds={selectedCandidateIds}
          initialAvailability={av}
          saving={saving}
          onSave={async (candidateIds, busyWeekdays, busyTimeZones, busyMonthPeriod, freeComment, seminarWishes, lecturePersonWish) => {
            setSaving(true);
            setMessage(null);
            try {
              await submitMeetingResponses(editMemberId, candidateIds);
              await submitAvailability(
                editMemberId,
                [], // free_weekdays は未使用
                busyWeekdays,
                [], // free_time_zones
                busyTimeZones,
                busyMonthPeriod,
                freeComment,
                seminarWishes,
                lecturePersonWish
              );
              setMessage({ type: "ok", text: "保存しました。" });
              load();
              setEditMemberId(null);
            } catch (e) {
              setMessage({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
            } finally {
              setSaving(false);
            }
          }}
          onClose={() => setEditMemberId(null)}
        />
      )}
    </div>
  );
}

function EditModal({
  memberName: name,
  candidates,
  initialCandidateIds,
  initialAvailability,
  saving,
  onSave,
  onClose,
}: {
  memberName: string;
  candidates: Candidate[];
  initialCandidateIds: Set<string>;
  initialAvailability: AvailabilityRow | null;
  saving: boolean;
  onSave: (
    candidateIds: string[],
    busyWeekdays: string[],
    busyTimeZones: string[],
    busyMonthPeriod: string[],
    freeComment: string | null,
    seminarWishes: { selected: string[]; other: string },
    lecturePersonWish: string | null
  ) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(initialCandidateIds);
  const [busyWeekdays, setBusyWeekdays] = useState<Set<string>>(new Set(initialAvailability?.busy_weekdays ?? []));
  const [busyTimeZones, setBusyTimeZones] = useState<Set<string>>(new Set(initialAvailability?.busy_time_zones ?? []));
  const [busyMonthPeriod, setBusyMonthPeriod] = useState<Set<string>>(new Set(initialAvailability?.busy_month_period ?? []));
  const [freeComment, setFreeComment] = useState(initialAvailability?.free_comment ?? "");
  const [seminarSelected, setSeminarSelected] = useState<Set<string>>(new Set(initialAvailability?.seminar_wishes?.selected ?? []));
  const [seminarOther, setSeminarOther] = useState(initialAvailability?.seminar_wishes?.other ?? "");
  const [lecturePersonWish, setLecturePersonWish] = useState(initialAvailability?.lecture_person_wish ?? "");

  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = () => {
    onSave(
      Array.from(selectedDates),
      Array.from(busyWeekdays),
      Array.from(busyTimeZones),
      Array.from(busyMonthPeriod),
      freeComment.trim() || null,
      { selected: Array.from(seminarSelected), other: seminarOther },
      lecturePersonWish.trim() || null
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-bold text-stone-800">{name} の回答を修正</h3>
          <button type="button" onClick={onClose} className="p-2 text-stone-500 hover:text-stone-700 rounded-lg">
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">顔合わせ 参加できる日</p>
            <div className="flex flex-wrap gap-2">
              {candidates.map((c) => (
                <Chip
                  key={c.id}
                  label={c.label}
                  selected={selectedDates.has(c.id)}
                  onToggle={() => toggle(setSelectedDates, c.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">参加しにくい曜日</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <Chip key={d} label={d} selected={busyWeekdays.has(d)} onToggle={() => toggle(setBusyWeekdays, d)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">参加しにくい時間帯</p>
            <div className="flex flex-wrap gap-2">
              {TIME_ZONES.map((z) => (
                <Chip key={z} label={z} selected={busyTimeZones.has(z)} onToggle={() => toggle(setBusyTimeZones, z)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">忙しい時期</p>
            <div className="flex flex-wrap gap-2">
              {MONTH_PERIODS.map((p) => (
                <Chip key={p} label={p} selected={busyMonthPeriod.has(p)} onToggle={() => toggle(setBusyMonthPeriod, p)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">実施してほしいセミナー・学びたいこと</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {SEMINAR_OPTIONS.map((s) => (
                <Chip key={s} label={s} selected={seminarSelected.has(s)} onToggle={() => toggle(setSeminarSelected, s)} />
              ))}
            </div>
            <input
              type="text"
              value={seminarOther}
              onChange={(e) => setSeminarOther(e.target.value)}
              placeholder="その他"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">この人の講義を聞きたい</label>
            <input
              type="text"
              value={lecturePersonWish}
              onChange={(e) => setLecturePersonWish(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">その他コメント</label>
            <textarea
              value={freeComment}
              onChange={(e) => setFreeComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="p-4 border-t border-stone-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 text-sm">
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
