"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getScheduleEvents,
  getMinutes,
  getSharedMaterials,
  getIdeas,
} from "@/app/actions";

const LINKS = [
  { href: "/admin/schedule", label: "スケジュール", desc: "会議・例会・締切の予定を管理" },
  { href: "/admin/minutes", label: "議事録", desc: "委員会議事メモ・決定事項" },
  { href: "/admin/materials", label: "共有資料・連絡", desc: "資料リンク・連絡事項の管理" },
  { href: "/admin/ideas", label: "意見・アイデア", desc: "例会テーマ案・やりたいことをストック" },
  { href: "/admin/survey", label: "アンケート集計", desc: "初回顔合わせ・稼働アンケートの集計" },
  { href: "/admin/members", label: "委員・候補日", desc: "委員一覧・顔合わせ候補日の管理" },
] as const;

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<{ schedule: number; minutes: number; materials: number; ideas: number } | null>(null);

  useEffect(() => {
    Promise.all([
      getScheduleEvents().then((d) => d.length).catch(() => 0),
      getMinutes().then((d) => d.length).catch(() => 0),
      getSharedMaterials().then((d) => d.length).catch(() => 0),
      getIdeas().then((d) => d.length).catch(() => 0),
    ]).then(([schedule, minutes, materials, ideas]) => {
      setCounts({ schedule, minutes, materials, ideas });
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-stone-800">ダッシュボード</h2>
        <p className="text-sm text-stone-500 mt-1">左のメニューから各項目を管理できます。委員向けページはトップURL（/）をそのまま共有できます。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map(({ href, label, desc }) => {
          const count =
            label === "スケジュール" ? counts?.schedule
            : label === "議事録" ? counts?.minutes
            : label === "共有資料・連絡" ? counts?.materials
            : label === "意見・アイデア" ? counts?.ideas
            : null;
          return (
            <Link
              key={href}
              href={href}
              className="block p-5 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-amber-200 hover:shadow-md hover:bg-amber-50/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">{label}</span>
                {count !== undefined && count !== null && (
                  <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{count}件</span>
                )}
              </div>
              <p className="text-sm text-stone-500 mt-2">{desc}</p>
            </Link>
          );
        })}
      </div>

      <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/80">
        <p className="font-semibold text-amber-900">委員向けページ</p>
        <p className="text-sm text-amber-800 mt-1">スケジュール・議事録・共有資料を委員に共有する場合は <a href="/" className="underline font-medium" target="_blank" rel="noopener noreferrer">トップページ（/）</a> のURLを共有してください。</p>
      </div>
    </div>
  );
}
