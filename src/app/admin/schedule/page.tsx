"use client";

import { useEffect, useState } from "react";
import type { ScheduleEvent } from "@/app/actions";
import {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} from "@/app/actions";

export default function AdminSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    event_date: "",
    start_time: "",
    end_time: "",
    place: "",
    memo: "",
  });

  const load = () => {
    getScheduleEvents()
      .then(setEvents)
      .catch(() => setError("取得に失敗しました。Supabase に schedule_events テーブルがありますか？"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date) return;
    try {
      await createScheduleEvent({
        title: form.title.trim(),
        event_date: form.event_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        place: form.place.trim() || null,
        memo: form.memo.trim() || null,
        sort_order: 0,
      });
      setForm({ title: "", event_date: "", start_time: "", end_time: "", place: "", memo: "" });
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleUpdate = async (id: string, input: Partial<ScheduleEvent>) => {
    try {
      await updateScheduleEvent(id, input);
      setEditingId(null);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この予定を削除しますか？")) return;
    try {
      await deleteScheduleEvent(id);
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  if (loading) return <p className="text-stone-500">読み込み中…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">スケジュール</h2>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleCreate} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
        <h3 className="font-semibold text-stone-700">予定を追加</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            placeholder="タイトル *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="time"
            placeholder="開始"
            value={form.start_time}
            onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            type="time"
            placeholder="終了"
            value={form.end_time}
            onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="場所"
            value={form.place}
            onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <textarea
            placeholder="メモ"
            value={form.memo}
            onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm sm:col-span-2"
            rows={2}
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">
          追加
        </button>
      </form>

      <section className="space-y-2">
        <h3 className="font-semibold text-stone-700">登録済み予定</h3>
        {events.length === 0 ? (
          <p className="text-sm text-stone-400">まだ予定はありません</p>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="p-4 bg-white rounded-xl border border-stone-200 flex flex-wrap items-start justify-between gap-2"
            >
              {editingId === ev.id ? (
                <InlineEditSchedule
                  ev={ev}
                  onSave={(input) => handleUpdate(ev.id, input)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div>
                    <span className="font-medium text-stone-800">{ev.title}</span>
                    <span className="ml-2 text-sm text-stone-500">
                      {ev.event_date}
                      {ev.start_time && ` ${ev.start_time}`}
                      {ev.end_time && `〜${ev.end_time}`}
                      {ev.place && ` @ ${ev.place}`}
                    </span>
                    {ev.memo && <p className="text-sm text-stone-600 mt-1">{ev.memo}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(ev.id)}
                      className="text-sm text-amber-600 underline"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev.id)}
                      className="text-sm text-red-600 underline"
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function InlineEditSchedule({
  ev,
  onSave,
  onCancel,
}: {
  ev: ScheduleEvent;
  onSave: (input: Partial<ScheduleEvent>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(ev.title);
  const [event_date, setEvent_date] = useState(ev.event_date);
  const [start_time, setStart_time] = useState(ev.start_time ?? "");
  const [end_time, setEnd_time] = useState(ev.end_time ?? "");
  const [place, setPlace] = useState(ev.place ?? "");
  const [memo, setMemo] = useState(ev.memo ?? "");

  return (
    <div className="flex-1 space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <input type="date" value={event_date} onChange={(e) => setEvent_date(e.target.value)} className="rounded border px-2 py-1 text-sm" />
        <input type="time" value={start_time} onChange={(e) => setStart_time(e.target.value)} className="rounded border px-2 py-1 text-sm" />
        <input type="time" value={end_time} onChange={(e) => setEnd_time(e.target.value)} className="rounded border px-2 py-1 text-sm" />
        <input type="text" placeholder="場所" value={place} onChange={(e) => setPlace(e.target.value)} className="rounded border px-2 py-1 text-sm" />
      </div>
      <textarea value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" rows={2} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ title, event_date, start_time: start_time || null, end_time: end_time || null, place: place || null, memo: memo || null })}
          className="text-sm text-amber-600 underline"
        >
          保存
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-stone-500 underline">
          キャンセル
        </button>
      </div>
    </div>
  );
}
