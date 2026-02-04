"use client";

import { useEffect, useState } from "react";
import type { Minute } from "@/app/actions";
import {
  getMinutes,
  createMinute,
  updateMinute,
  deleteMinute,
} from "@/app/actions";

export default function AdminMinutesPage() {
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", minute_date: "", body: "" });

  const load = () => {
    getMinutes()
      .then(setMinutes)
      .catch(() => setError("取得に失敗しました。Supabase に minutes テーブルがありますか？"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await createMinute({
        title: form.title.trim(),
        minute_date: form.minute_date || null,
        body: form.body.trim() || null,
      });
      setForm({ title: "", minute_date: "", body: "" });
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleUpdate = async (id: string, input: Partial<Minute>) => {
    try {
      await updateMinute(id, input);
      setEditingId(null);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この議事録を削除しますか？")) return;
    try {
      await deleteMinute(id);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  if (loading) return <p className="text-stone-500">読み込み中…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">議事録</h2>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleCreate} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
        <h3 className="font-semibold text-stone-700">議事録を追加</h3>
        <input
          type="text"
          placeholder="タイトル *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="date"
          value={form.minute_date}
          onChange={(e) => setForm((f) => ({ ...f, minute_date: e.target.value }))}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="本文（議事メモ・決定事項など）"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm min-h-[120px]"
          rows={5}
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">
          追加
        </button>
      </form>

      <section className="space-y-2">
        <h3 className="font-semibold text-stone-700">登録済み議事録</h3>
        {minutes.length === 0 ? (
          <p className="text-sm text-stone-400">まだ議事録はありません</p>
        ) : (
          minutes.map((m) => (
            <div
              key={m.id}
              className="p-4 bg-white rounded-xl border border-stone-200"
            >
              {editingId === m.id ? (
                <InlineEditMinute
                  m={m}
                  onSave={(input) => handleUpdate(m.id, input)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-stone-800">{m.title}</span>
                      {m.minute_date && (
                        <span className="ml-2 text-sm text-stone-500">{m.minute_date}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditingId(m.id)} className="text-sm text-amber-600 underline">編集</button>
                      <button type="button" onClick={() => handleDelete(m.id)} className="text-sm text-red-600 underline">削除</button>
                    </div>
                  </div>
                  {m.body && (
                    <div className="mt-2 text-sm text-stone-600 whitespace-pre-wrap">{m.body}</div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function InlineEditMinute({
  m,
  onSave,
  onCancel,
}: {
  m: Minute;
  onSave: (input: Partial<Minute>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(m.title);
  const [minute_date, setMinute_date] = useState(m.minute_date ?? "");
  const [body, setBody] = useState(m.body ?? "");

  return (
    <div className="space-y-2">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" />
      <input type="date" value={minute_date} onChange={(e) => setMinute_date(e.target.value)} className="rounded border px-2 py-1 text-sm" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full rounded border px-2 py-1 text-sm min-h-[100px]" rows={4} />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave({ title, minute_date: minute_date || null, body: body || null })} className="text-sm text-amber-600 underline">保存</button>
        <button type="button" onClick={onCancel} className="text-sm text-stone-500 underline">キャンセル</button>
      </div>
    </div>
  );
}
