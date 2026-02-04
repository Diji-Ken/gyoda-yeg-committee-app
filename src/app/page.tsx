"use client";

import { useEffect, useState } from "react";
import { getMembers, getMeetingCandidates, submitAll } from "./actions";
import {
  WEEKDAYS,
  TIME_ZONES,
  MONTH_PERIODS,
  SEMINAR_OPTIONS,
} from "@/lib/supabase";
import { SURVEY_CONFIG, getDeadlineDisplay } from "@/lib/surveyConfig";

type Member = { id: string; name: string; role: string | null };
type Candidate = { id: string; label: string };

const STEPS = [
  "ご挨拶",
  "お名前",
  "顔合わせ 参加できる日",
  "参加しにくい曜日",
  "参加しにくい時間帯",
  "忙しい時期",
  "実施してほしいセミナー・学びたいこと",
] as const;

function Chip<T extends string>({
  label,
  selected,
  onToggle,
  className = "",
}: {
  label: T;
  selected: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`min-h-[48px] px-4 py-3 rounded-xl text-sm font-medium transition touch-manipulation ${className} ${
        selected
          ? "bg-amber-500 text-white ring-2 ring-amber-600"
          : "bg-white border border-stone-300 text-stone-700 hover:border-amber-400"
      }`}
    >
      {label}
    </button>
  );
}

export default function ResponsePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [step, setStep] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [busyWeekdays, setBusyWeekdays] = useState<Set<string>>(new Set());
  const [busyTimeZones, setBusyTimeZones] = useState<Set<string>>(new Set());
  const [busyMonthPeriod, setBusyMonthPeriod] = useState<Set<string>>(new Set());
  const [seminarSelected, setSeminarSelected] = useState<Set<string>>(new Set());
  const [seminarOther, setSeminarOther] = useState("");
  const [lecturePersonWish, setLecturePersonWish] = useState("");
  const [freeComment, setFreeComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([getMembers(), getMeetingCandidates()])
      .then(([m, c]) => {
        setMembers(m as Member[]);
        setCandidates(c as Candidate[]);
      })
      .catch(() =>
        setMessage({ type: "error", text: "データの取得に失敗しました。環境変数を確認してください。" })
      )
      .finally(() => setLoading(false));
  }, []);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    key: string
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const canNext = () => {
    if (step === 1) return !!selectedMemberId;
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedMemberId) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await submitAll(
        selectedMemberId,
        Array.from(selectedDates),
        [],
        Array.from(busyWeekdays),
        [],
        Array.from(busyTimeZones),
        Array.from(busyMonthPeriod),
        freeComment.trim() || null,
        { selected: Array.from(seminarSelected), other: seminarOther.trim() },
        lecturePersonWish.trim() || null
      );
      setMessage({ type: "ok", text: "回答を送信しました。ありがとうございます。" });
    } catch {
      setMessage({
        type: "error",
        text: "送信に失敗しました。しばらくしてから再度お試しください。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <p className="text-stone-500">読み込み中…</p>
      </div>
    );
  }

  const isLastStep = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col">
      <header className="bg-white border-b border-stone-200 py-4 px-4 shrink-0">
        <div className="max-w-lg mx-auto">
          {SURVEY_CONFIG.isOpen && (
            <p className="text-center mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-medium">
                募集中
              </span>
              <span className="ml-2 text-sm text-amber-800 font-medium">
                {getDeadlineDisplay()}までにご回答ください
              </span>
            </p>
          )}
          <h1 className="text-lg font-bold text-center">ビジネス協同委員会</h1>
          <p className="text-sm text-stone-500 text-center mt-1">
            初回顔合わせ・稼働アンケート
          </p>
          <div className="mt-3 h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 text-center mt-1">
            {step + 1} / {STEPS.length}
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-8">
        {step === 0 && (
          <section className="space-y-5">
            <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
              <p className="text-stone-700 leading-relaxed">
                今回、ビジネス協同委員会として、皆さんと次年度1年、一緒に頑張っていきたいと思っております。ぜひよろしくお願いいたします。
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                この委員会は、<strong>会員同士が知見や経験を持ち寄り、業種を超えた学びや協業の可能性を見出す</strong>場です。自社の経営・事業の発展や企業の付加価値向上につながる気づきを得られる事業を担当します。
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                良い1年のスタートを切るために、こちらのアンケートに<strong>全員ご記入</strong>いただけますと幸いです。
                {SURVEY_CONFIG.isOpen && (
                  <span className="block mt-2 text-amber-700 font-medium">
                    回答締切：{getDeadlineDisplay()}
                  </span>
                )}
              </p>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-3">
            <p className="text-sm font-semibold text-amber-800">{STEPS[1]}</p>
            <p className="text-xs text-stone-500">お名前を選んでください</p>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-4 text-base"
              required
            >
              <option value="">選択してください</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-3">
            <p className="text-sm font-semibold text-amber-800">{STEPS[2]}</p>
            <p className="text-xs text-stone-500">
              参加できる日をタップで選んでください（複数可）
            </p>
            {candidates.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-2">
                <p>現在、候補日は設定されていません。委員長がSupabaseの「顔合わせ候補日」を登録すると、ここにタップできる日が表示されます。</p>
                <p>表示されない場合は委員長までお知らせください。そのまま「次へ」で先に進めます。</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {candidates.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.label as string}
                    selected={selectedDates.has(c.id)}
                    onToggle={() => toggle(setSelectedDates, c.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="space-y-3">
            <p className="text-sm font-semibold text-amber-800">{STEPS[3]}</p>
            <p className="text-xs text-stone-500 mb-2">参加しにくい曜日をタップ（複数可）。委員会の日程調整の参考にします</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  selected={busyWeekdays.has(d)}
                  onToggle={() => toggle(setBusyWeekdays, d)}
                  className="w-14 justify-center"
                />
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-3">
            <p className="text-sm font-semibold text-amber-800">{STEPS[4]}</p>
            <p className="text-xs text-stone-500 mb-2">参加しにくい時間帯をタップ（複数可）。18時以降は1時間単位</p>
            <div className="flex flex-wrap gap-2">
              {TIME_ZONES.map((z) => (
                <Chip
                  key={z}
                  label={z}
                  selected={busyTimeZones.has(z)}
                  onToggle={() => toggle(setBusyTimeZones, z)}
                />
              ))}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="space-y-3">
            <p className="text-sm font-semibold text-amber-800">{STEPS[5]}</p>
            <p className="text-xs text-stone-500">
              普段、忙しい時期をタップ（複数可）。委員会の日程調整の参考にします
            </p>
            <div className="flex flex-wrap gap-2">
              {MONTH_PERIODS.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  selected={busyMonthPeriod.has(p)}
                  onToggle={() => toggle(setBusyMonthPeriod, p)}
                />
              ))}
            </div>
          </section>
        )}

        {step === 6 && (
          <section className="space-y-4">
            <p className="text-sm font-semibold text-amber-800">{STEPS[6]}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900 space-y-2">
              <p>
                本委員会は、セミナーだったり学べる場、もしくはビジネス創造の場を用意したいと考えています。
              </p>
              <p>
                例会などで実施したいことを、皆さんの中からどんどん声を拾っていきたいと思っています。複数選択できます。
              </p>
            </div>
            <p className="text-xs text-stone-500">実施してほしいセミナーや学びたいことをタップ（複数可）</p>
            <div className="flex flex-wrap gap-2">
              {SEMINAR_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={seminarSelected.has(s)}
                  onToggle={() => toggle(setSeminarSelected, s)}
                />
              ))}
            </div>
            <p className="text-xs text-stone-500 mt-3">選択肢にないものがあれば自由にどうぞ</p>
            <textarea
              value={seminarOther}
              onChange={(e) => setSeminarOther(e.target.value)}
              placeholder="例：AI活用、経理の基礎 など"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm min-h-[72px]"
              rows={2}
            />
            <p className="text-xs text-stone-500 mt-3">この人の講義を聞きたい（あれば名指しでどうぞ）</p>
            <input
              type="text"
              value={lecturePersonWish}
              onChange={(e) => setLecturePersonWish(e.target.value)}
              placeholder="例：〇〇さんにマーケティングの話を聞きたい"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
            />
            <p className="text-xs text-stone-500 mt-3">その他コメントがあれば</p>
            <textarea
              value={freeComment}
              onChange={(e) => setFreeComment(e.target.value)}
              placeholder="自由にご記入ください"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm min-h-[80px]"
              rows={3}
            />
          </section>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === "ok"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-4 rounded-xl border border-stone-300 bg-white font-semibold text-stone-600"
            >
              戻る
            </button>
          )}
          {!isLastStep ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-4 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-50"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-4 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-50"
            >
              {submitting ? "送信中…" : "回答を送信する"}
            </button>
          )}
        </div>
      </main>

      <footer className="text-center py-4 border-t border-stone-200">
        <a href="/board" className="text-sm text-stone-500 underline">委員会メンバー（スケジュール・議事録・連絡）</a>
      </footer>
    </div>
  );
}
