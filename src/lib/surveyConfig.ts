/**
 * アンケート募集の設定（締切・表示用）
 * 変更時はアンケートページ・委員向けページの表示が変わる
 */
export const SURVEY_CONFIG = {
  /** 締切日（YYYY-MM-DD） */
  deadline: "2026-02-10",
  /** 表示用ラベル（例: 2/10） */
  deadlineLabel: "2/10",
  /** 募集中かどうか（false にすると「募集中」バッジ等を非表示にできる） */
  isOpen: true,
} as const;

export function getDeadlineDisplay(): string {
  return `${SURVEY_CONFIG.deadlineLabel}（締切）`;
}
