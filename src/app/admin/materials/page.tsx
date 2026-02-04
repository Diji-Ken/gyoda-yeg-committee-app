"use client";

import { useEffect, useState } from "react";
import type { SharedMaterial } from "@/app/actions";
import {
  getSharedMaterials,
  createSharedMaterial,
  updateSharedMaterial,
  deleteSharedMaterial,
} from "@/app/actions";

const KINDS = [{ value: "notice", label: "連絡・お知らせ" }, { value: "link", label: "リンク" }, { value: "file", label: "ファイル" }] as const;

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<SharedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    kind: "notice" as "notice" | "link" | "file",
    url: "",
    body: "",
  });

  const load = () => {
    getSharedMaterials()
      .then(setMaterials)
      .catch(() => setError("取得に失敗しました。Supabase に shared_materials テーブルがありますか？"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await createSharedMaterial({
        title: form.title.trim(),
        kind: form.kind,
        url: form.url.trim() || null,
        body: form.body.trim() || null,
        sort_order: 0,
      });
      setForm({ title: "", kind: "notice", url: "", body: "" });
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleUpdate = async (id: string, input: Partial<SharedMaterial>) => {
    try {
      await updateSharedMaterial(id, input);
      setEditingId(null);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この項目を削除しますか？")) return;
    try {
      await deleteSharedMaterial(id);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  if (loading) return <p className="text-stone-500">読み込み中…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">共有資料・連絡</h2>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleCreate} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
        <h3 className="font-semibold text-stone-700">項目を追加</h3>
        <input
          type="text"
          placeholder="タイトル *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          required
        />
        <select
          value={form.kind}
          onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as "notice" | "link" | "file" }))}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        {(form.kind === "link" || form.kind === "file") && (
          <input
            type="url"
            placeholder="URL"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        )}
        {(form.kind === "notice" || form.body) && (
          <textarea
            placeholder="本文（連絡・お知らせの場合）"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm min-h-[80px]"
            rows={3}
          />
        )}
        <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">
          追加
        </button>
      </form>

      <section className="space-y-2">
        <h3 className="font-semibold text-stone-700">登録済み</h3>
        {materials.length === 0 ? (
          <p className="text-sm text-stone-400">まだありません</p>
        ) : (
          materials.map((mat) => (
            <div key={mat.id} className="p-4 bg-white rounded-xl border border-stone-200">
              {editingId === mat.id ? (
                <InlineEditMaterial
                  mat={mat}
                  onSave={(input) => handleUpdate(mat.id, input)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-stone-800">{mat.title}</span>
                      <span className="ml-2 text-xs text-stone-400">
                        {KINDS.find((k) => k.value === mat.kind)?.label ?? mat.kind}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditingId(mat.id)} className="text-sm text-amber-600 underline">編集</button>
                      <button type="button" onClick={() => handleDelete(mat.id)} className="text-sm text-red-600 underline">削除</button>
                    </div>
                  </div>
                  {mat.url && (
                    <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 underline block mt-1">{mat.url}</a>
                  )}
                  {mat.body && <div className="mt-2 text-sm text-stone-600 whitespace-pre-wrap">{mat.body}</div>}
                </>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function InlineEditMaterial({
  mat,
  onSave,
  onCancel,
}: {
  mat: SharedMaterial;
  onSave: (input: Partial<SharedMaterial>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(mat.title);
  const [kind, setKind] = useState(mat.kind);
  const [url, setUrl] = useState(mat.url ?? "");
  const [body, setBody] = useState(mat.body ?? "");

  return (
    <div className="space-y-2">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" />
      <select value={kind} onChange={(e) => setKind(e.target.value as "notice" | "link" | "file")} className="rounded border px-2 py-1 text-sm">
        {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
      </select>
      <input type="url" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" rows={3} />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave({ title, kind, url: url || null, body: body || null })} className="text-sm text-amber-600 underline">保存</button>
        <button type="button" onClick={onCancel} className="text-sm text-stone-500 underline">キャンセル</button>
      </div>
    </div>
  );
}
