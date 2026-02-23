/**
 * アンケート表示ユーティリティ
 * is_open / deadline はすべて DB (surveys テーブル) から取得する
 */

export function formatDeadlineDisplay(deadlineAt: string | null): string {
  if (!deadlineAt) return "";
  const d = new Date(deadlineAt);
  return `${d.getMonth() + 1}/${d.getDate()}（締切）`;
}
