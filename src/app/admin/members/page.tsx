"use client";

import { useEffect, useState } from "react";
import {
  getMembers,
  getMeetingCandidates,
  seedMeetingCandidatesIfEmpty,
} from "@/app/actions";

type Member = { id: string; name: string; role: string | null };
type Candidate = { id: string; label: string };

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    Promise.all([getMembers(), getMeetingCandidates()])
      .then(([m, c]) => {
        setMembers(m as Member[]);
        setCandidates(c as Candidate[]);
      })
      .catch(() => setError("データの取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-stone-500">読み込み中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">委員・候補日</h2>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">委員一覧</h3>
        <p className="text-xs text-stone-500 mb-2">委員の追加・変更は Supabase の members テーブルで行います</p>
        <ul className="text-sm text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
          {members.map((m) => (
            <li key={m.id}>{m.name}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">顔合わせ候補日一覧</h3>
        <p className="text-xs text-stone-500 mb-2">候補日の追加・変更は Supabase の meeting_candidates で行います。0件のときは下のボタンで初期データを投入できます。</p>
        {seedMessage && (
          <div className={`mb-3 p-3 rounded-lg text-sm ${seedMessage.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {seedMessage.text}
          </div>
        )}
        {candidates.length === 0 ? (
          <div>
            <p className="text-sm text-stone-600 mb-3">現在、候補日は0件です。</p>
            <button
              type="button"
              onClick={async () => {
                setSeeding(true);
                setSeedMessage(null);
                const result = await seedMeetingCandidatesIfEmpty();
                setSeedMessage({ type: result.ok ? "ok" : "error", text: result.message });
                if (result.ok && result.message.includes("18件")) {
                  const c = await getMeetingCandidates();
                  setCandidates(c as Candidate[]);
                }
                setSeeding(false);
              }}
              disabled={seeding}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm disabled:opacity-50"
            >
              {seeding ? "投入中…" : "候補日を初期データで投入（2月・3月の18日分）"}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 text-sm text-stone-600">
            {candidates.map((c) => (
              <span key={c.id} className="px-2 py-1 bg-stone-100 rounded">{c.label}</span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
