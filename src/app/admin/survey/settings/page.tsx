"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSurvey,
  updateSurvey,
  getMeetingCandidates,
  createMeetingCandidate,
  updateMeetingCandidate,
  deleteMeetingCandidate,
  seedMeetingCandidatesIfEmpty,
} from "@/app/actions";

type Candidate = { id: string; candidate_date: string; time_slot: string | null; label: string; sort_order: number };

export default function SurveySettingsPage() {
  const [survey, setSurvey] = useState<{ name: string; deadline_at: string | null; is_open: boolean } | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");

  const load = () => {
    Promise.all([getSurvey(), getMeetingCandidates()])
      .then(([s, c]) => {
        setSurvey(s ? { name: s.name, deadline_at: s.deadline_at, is_open: s.is_open } : null);
        setCandidates((c as Candidate[]) ?? []);
      })
      .catch(() => setError("データの取得に失敗しました。"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveSurvey = async () => {
    if (!survey) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateSurvey({
        name: survey.name,
        deadline_at: survey.deadline_at || null,
        is_open: survey.is_open,
      });
      setMessage({ type: "ok", text: "保存しました。" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "保存に失敗しました。" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCandidate = async () => {
    const label = newLabel.trim();
    const date = newDate.trim();
    if (!label || !date) {
      setMessage({ type: "error", text: "日付とラベルを入力してください。" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await createMeetingCandidate({
        candidate_date: date,
        label,
        sort_order: candidates.length + 1,
      });
      setNewLabel("");
      setNewDate("");
      load();
      setMessage({ type: "ok", text: "候補日を追加しました。" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "追加に失敗しました。" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCandidate = async (id: string, label: string, candidate_date: string) => {
    setSaving(true);
    setMessage(null);
    try {
      await updateMeetingCandidate(id, { label, candidate_date });
      setEditingCandidate(null);
      load();
      setMessage({ type: "ok", text: "更新しました。" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "更新に失敗しました。" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("この候補日を削除しますか？")) return;
    setSaving(true);
    setMessage(null);
    try {
      await deleteMeetingCandidate(id);
      load();
      setMessage({ type: "ok", text: "削除しました。" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "削除に失敗しました。" });
    } finally {
      setSaving(false);
    }
  };

  const handleSeedCandidates = async () => {
    setSaving(true);
    setMessage(null);
    const result = await seedMeetingCandidatesIfEmpty();
    setMessage({ type: result.ok ? "ok" : "error", text: result.message });
    if (result.ok) load();
    setSaving(false);
  };

  if (loading) return <p className="text-stone-500">読み込み中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">アンケート設定</h2>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">今回のアンケート</h3>
        <p className="text-xs text-stone-500 mb-4">
          名前・締切日・募集中フラグを編集できます。委員一覧は
          <Link href="/admin/members" className="text-amber-600 hover:underline">委員</Link>
          で確認・管理します。
        </p>
        {survey ? (
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">アンケート名</label>
              <input
                type="text"
                value={survey.name}
                onChange={(e) => setSurvey((s) => (s ? { ...s, name: e.target.value } : null))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">締切日（YYYY-MM-DD）</label>
              <input
                type="date"
                value={survey.deadline_at ?? ""}
                onChange={(e) => setSurvey((s) => (s ? { ...s, deadline_at: e.target.value || null } : null))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={survey.is_open}
                onChange={(e) => setSurvey((s) => (s ? { ...s, is_open: e.target.checked } : null))}
                className="rounded border-stone-300"
              />
              <span className="text-sm text-stone-700">募集中として表示する</span>
            </label>
            <button
              type="button"
              onClick={handleSaveSurvey}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm disabled:opacity-50"
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-amber-700">
            surveys テーブルがありません。Supabase で <code className="bg-stone-100 px-1 rounded">supabase/schema_surveys.sql</code> を実行してください。
          </p>
        )}
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">顔合わせ候補日（今回の集計用）</h3>
        <p className="text-xs text-stone-500 mb-4">このアンケートで選択してもらう候補日を追加・編集・削除できます。</p>

        {candidates.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-stone-600">現在、候補日は0件です。下のボタンで2月・3月の初期データを投入するか、手動で追加してください。</p>
            <button
              type="button"
              onClick={handleSeedCandidates}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm disabled:opacity-50"
            >
              {saving ? "投入中…" : "候補日を初期データで投入（2月・3月）"}
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-2 mb-4">
              {candidates.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 py-2 border-b border-stone-100 last:border-0">
                  {editingCandidate === c.id ? (
                    <>
                      <input
                        type="date"
                        defaultValue={c.candidate_date}
                        id={`date-${c.id}`}
                        className="px-2 py-1 border border-stone-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        defaultValue={c.label}
                        id={`label-${c.id}`}
                        placeholder="ラベル"
                        className="px-2 py-1 border border-stone-300 rounded text-sm flex-1 min-w-[120px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const dateEl = document.getElementById(`date-${c.id}`) as HTMLInputElement;
                          const labelEl = document.getElementById(`label-${c.id}`) as HTMLInputElement;
                          if (dateEl && labelEl) handleUpdateCandidate(c.id, labelEl.value.trim(), dateEl.value);
                        }}
                        disabled={saving}
                        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCandidate(null)}
                        className="px-3 py-1 rounded bg-stone-300 text-stone-700 text-sm"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-stone-700 w-28">{c.label}</span>
                      <span className="text-stone-500 text-sm">{c.candidate_date}</span>
                      <button
                        type="button"
                        onClick={() => setEditingCandidate(c.id)}
                        className="text-amber-600 hover:text-amber-700 text-sm"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCandidate(c.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        削除
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-stone-200">
              <div>
                <label className="block text-xs text-stone-500 mb-1">日付</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="px-2 py-1.5 border border-stone-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">ラベル（例: 2/10(火)）</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="2/10(火)"
                  className="px-2 py-1.5 border border-stone-300 rounded text-sm w-28"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCandidate}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm disabled:opacity-50"
              >
                追加
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
