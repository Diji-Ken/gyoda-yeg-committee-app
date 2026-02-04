"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getScheduleEvents,
  getMinutes,
  getSharedMaterials,
} from "@/app/actions";
import { SURVEY_CONFIG, getDeadlineDisplay } from "@/lib/surveyConfig";
import type { ScheduleEvent } from "@/app/actions";

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
}

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":");
  return `${h}:${m}`;
}

export default function BoardPage() {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [minutes, setMinutes] = useState<Awaited<ReturnType<typeof getMinutes>>>([]);
  const [materials, setMaterials] = useState<Awaited<ReturnType<typeof getSharedMaterials>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getScheduleEvents(), getMinutes(), getSharedMaterials()])
      .then(([s, m, mat]) => {
        setSchedule(s);
        setMinutes(m);
        setMaterials(mat);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const todayStr = today();
  const upcomingEvents = schedule.filter((ev) => ev.event_date >= todayStr);
  const nextEvent = upcomingEvents[0] ?? null;
  const restUpcoming = upcomingEvents.slice(1, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 to-stone-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-stone-500 text-sm">読み込み中…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 to-stone-50 text-stone-800 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">YEG</span>
            </div>
            <span className="font-bold text-stone-800">ビジネス協同委員会</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* アンケートご協力 CTA - 目立つカード */}
        <section>
          <Link
            href="/"
            className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 shadow-lg shadow-amber-500/25 text-white hover:shadow-xl hover:shadow-amber-500/30 transition-shadow active:scale-[0.99]"
          >
            <span className="absolute top-3 right-3 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
              {SURVEY_CONFIG.isOpen ? "募集中" : "ご協力お願いします"}
            </span>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg leading-tight">アンケートにご協力ください</h2>
                <p className="text-amber-100 text-sm mt-1">
                  初回顔合わせ・稼働のご希望を教えてください。タップして回答へ
                  {SURVEY_CONFIG.isOpen && (
                    <span className="block mt-1 text-amber-200 font-medium">締切 {getDeadlineDisplay()}</span>
                  )}
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium">
                  回答する
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* 次回の予定・直近 */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">いつ何があるか</h2>
          {nextEvent ? (
            <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-200/50">
                <p className="text-xs font-medium text-amber-800">次回の予定</p>
              </div>
              <div className="p-4">
                <p className="font-bold text-stone-800 text-lg">{nextEvent.title}</p>
                <p className="text-stone-600 text-sm mt-1">
                  {formatDate(nextEvent.event_date)}
                  {nextEvent.start_time && ` ${formatTime(nextEvent.start_time)}`}
                  {nextEvent.end_time && ` 〜 ${formatTime(nextEvent.end_time)}`}
                  {nextEvent.place && ` · ${nextEvent.place}`}
                </p>
                {nextEvent.memo && (
                  <p className="text-stone-500 text-sm mt-2">{nextEvent.memo}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/60 border border-stone-200/80 p-5 text-center">
              <p className="text-stone-500 text-sm">直近の予定はありません</p>
              <p className="text-stone-400 text-xs mt-1">スケジュールは下の一覧でご確認ください</p>
            </div>
          )}

          {restUpcoming.length > 0 && (
            <ul className="mt-3 space-y-2">
              {restUpcoming.map((ev) => (
                <li key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-stone-200/80">
                  <span className="text-stone-400 text-sm shrink-0 w-16">{formatDate(ev.event_date)}</span>
                  <span className="font-medium text-stone-800 truncate">{ev.title}</span>
                  {ev.place && <span className="text-stone-400 text-xs shrink-0 truncate max-w-[80px]">{ev.place}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* スケジュール一覧 */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">スケジュール一覧</h2>
          {schedule.length === 0 ? (
            <div className="rounded-2xl bg-white/60 border border-stone-200/80 p-5 text-center text-stone-400 text-sm">
              現在、予定はありません
            </div>
          ) : (
            <ul className="space-y-2">
              {schedule.map((ev) => (
                <li key={ev.id} className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-medium text-stone-800">{ev.title}</p>
                  <p className="text-sm text-stone-500 mt-1">
                    {formatDate(ev.event_date)}
                    {ev.start_time && ` ${formatTime(ev.start_time)}`}
                    {ev.end_time && `〜${formatTime(ev.end_time)}`}
                    {ev.place && ` · ${ev.place}`}
                  </p>
                  {ev.memo && <p className="text-sm text-stone-600 mt-2">{ev.memo}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 議事録 */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">議事録</h2>
          {minutes.length === 0 ? (
            <div className="rounded-2xl bg-white/60 border border-stone-200/80 p-5 text-center text-stone-400 text-sm">
              まだ議事録はありません
            </div>
          ) : (
            <ul className="space-y-2">
              {minutes.map((m) => (
                <li key={m.id} className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm">
                  <p className="font-medium text-stone-800">{m.title}</p>
                  {m.minute_date && (
                    <p className="text-sm text-stone-500 mt-0.5">{formatDate(m.minute_date)}</p>
                  )}
                  {m.body && (
                    <div className="text-sm text-stone-600 mt-2 whitespace-pre-wrap line-clamp-3">{m.body}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 共有資料・連絡 */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">共有資料・連絡</h2>
          {materials.length === 0 ? (
            <div className="rounded-2xl bg-white/60 border border-stone-200/80 p-5 text-center text-stone-400 text-sm">
              まだありません
            </div>
          ) : (
            <ul className="space-y-2">
              {materials.map((mat) => (
                <li key={mat.id} className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm">
                  <p className="font-medium text-stone-800">{mat.title}</p>
                  {mat.url && (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-amber-600 font-medium hover:underline"
                    >
                      リンクを開く
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {mat.body && (
                    <div className="text-sm text-stone-600 mt-2 whitespace-pre-wrap">{mat.body}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-stone-200/80 py-2.5 px-4 safe-area-inset-bottom">
        <p className="text-center text-xs text-stone-400">
          委員会内限定の情報です。外部共有・スクショはご遠慮ください。
        </p>
      </footer>
    </div>
  );
}
