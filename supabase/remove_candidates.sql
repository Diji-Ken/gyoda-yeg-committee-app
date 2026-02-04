-- 指定した候補日を削除する（Supabase SQL Editor で実行）
-- 削除する日: 2/10, 2/12, 2/16, 2/27, 3/8, 3/10, 3/16, 3/23, 3/28
-- meeting_responses は ON DELETE CASCADE のため、候補日削除で連動して削除されます。

DELETE FROM meeting_candidates
WHERE candidate_date IN (
  '2026-02-10',
  '2026-02-12',
  '2026-02-16',
  '2026-02-27',
  '2026-03-08',
  '2026-03-10',
  '2026-03-16',
  '2026-03-23',
  '2026-03-28'
);
