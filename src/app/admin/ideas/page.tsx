"use client";

import { useEffect, useState } from "react";
import type { Idea } from "@/app/actions";
import {
  getIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
} from "@/app/actions";

const STATUSES = [
  { value: "open", label: "未検討" },
  { value: "adopted", label: "採用" },
  { value: "rejected", label: "見送り" },
  { value: "archived", label: "アーカイブ" },
] as const;

export default function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ content: "", source: "other" });

  const load = () => {
    getIdeas()
      .then(setIdeas)
      .catch(() => setError("取得に失敗しました。Supabase に ideas テーブルがありますか？"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    try {
      await createIdea({
        content: form.content.trim(),
        source: form.source || null,
        member_id: null,
        status: "open",
      });
      setForm({ content: "", source: "other" });
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleUpdate = async (id: string, input: Partial<Idea>) => {
    try {
      await updateIdea(id, input);
      setEditingId(null);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このアイデアを削除しますか？")) return;
    try {
      await deleteIdea(id);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  if (loading) return <p className="text-stone-500">読み込み中…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">意見・アイデア</h2>
      <p className="text-sm text-stone-500">例会テーマ案・やりたいこと・会議で出た意見をストックしておけます。</p>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleCreate} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
        <h3 className="font-semibold text-stone-700">アイデアを追加</h3>
        <textarea
          placeholder="内容 *"
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm min-h-[80px]"
          rows={3}
          required
        />
        <select
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="member">委員から</option>
          <option value="meeting">会議で</option>
          <option value="other">その他</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">
          追加
        </button>
      </form>

      <section className="space-y-2">
        <h3 className="font-semibold text-stone-700">ストック一覧</h3>
        {ideas.length === 0 ? (
          <p className="text-sm text-stone-400">まだありません</p>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="p-4 bg-white rounded-xl border border-stone-200">
              {editingId === idea.id ? (
                <InlineEditIdea
                  idea={idea}
                  onSave={(input) => handleUpdate(idea.id, input)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm text-stone-700 flex-1">{idea.content}</p>
                    <div className="flex items-center gap-2">
                      <select
                        value={idea.status}
                        onChange={(e) => handleUpdate(idea.id, { status: e.target.value })}
                        className="text-xs rounded border border-stone-300 px-2 py-1"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setEditingId(idea.id)} className="text-sm text-amber-600 underline">編集</button>
                      <button type="button" onClick={() => handleDelete(idea.id)} className="text-sm text-red-600 underline">削除</button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    {idea.source && <span>{idea.source}</span>}
                    <span className="ml-2">{new Date(idea.created_at).toLocaleDateString("ja-JP")}</span>
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function InlineEditIdea({
  idea,
  onSave,
  onCancel,
}: {
  idea: Idea;
  onSave: (input: Partial<Idea>) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(idea.content);

  return (
    <div className="space-y-2">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" rows={3} />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave({ content })} className="text-sm text-amber-600 underline">保存</button>
        <button type="button" onClick={onCancel} className="text-sm text-stone-500 underline">キャンセル</button>
      </div>
    </div>
  );
}
