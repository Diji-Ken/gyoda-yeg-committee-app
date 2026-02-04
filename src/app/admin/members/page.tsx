"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMembers } from "@/app/actions";

type Member = { id: string; name: string; role: string | null };

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMembers()
      .then((m) => setMembers((m as Member[]) ?? []))
      .catch(() => setError("データの取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-stone-500">読み込み中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">委員</h2>

      <section className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-700 mb-3">委員一覧</h3>
        <p className="text-xs text-stone-500 mb-3">
          委員の追加・変更は Supabase の <code className="bg-stone-100 px-1 rounded">members</code> テーブルで行います。
        </p>
        <ul className="text-sm text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
          {members.map((m) => (
            <li key={m.id}>{m.name}</li>
          ))}
        </ul>
        <p className="text-xs text-stone-500 mt-4 pt-3 border-t border-stone-100">
          顔合わせの候補日（今回のアンケートで選んでもらう日）は
          <Link href="/admin/survey/settings" className="text-amber-600 hover:underline ml-1">
            アンケート → 設定
          </Link>
          で管理します。
        </p>
      </section>
    </div>
  );
}
