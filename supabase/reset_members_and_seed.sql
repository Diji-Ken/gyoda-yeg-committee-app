-- 【注意】実行すると meeting_responses / availability_responses の回答データがすべて消えます。
-- 委員を15名にリセットしたいときだけ、Supabase SQL Editor でこのファイルを実行してください。

DELETE FROM meeting_responses;
DELETE FROM availability_responses;
DELETE FROM meeting_candidates;
DELETE FROM members;

INSERT INTO members (name, role, sort_order) VALUES
  ('福田馨子', NULL, 1),
  ('松岡哲平', NULL, 2),
  ('小林永典', NULL, 3),
  ('長島寛', NULL, 4),
  ('松田久', NULL, 5),
  ('飯島崇之', NULL, 6),
  ('岩勘将悟', NULL, 7),
  ('栗原順哉', NULL, 8),
  ('斉藤智彦', NULL, 9),
  ('塩田和彦', NULL, 10),
  ('篠﨑勇', NULL, 11),
  ('藤井千尋', NULL, 12),
  ('堀口豊', NULL, 13),
  ('武笠匠', NULL, 14),
  ('野本純志', NULL, 15);

-- 候補日も入れ直す（リセットしたので空になっているため）
INSERT INTO meeting_candidates (candidate_date, time_slot, label, sort_order) VALUES
  ('2026-02-10', NULL, '2/10(火)', 1),
  ('2026-02-11', NULL, '2/11(水祝)', 2),
  ('2026-02-12', NULL, '2/12(木)', 3),
  ('2026-02-16', NULL, '2/16(月)', 4),
  ('2026-02-22', NULL, '2/22(日)', 5),
  ('2026-02-23', NULL, '2/23(月祝)', 6),
  ('2026-02-25', NULL, '2/25(水)', 7),
  ('2026-03-01', NULL, '3/1(日)', 8),
  ('2026-03-05', NULL, '3/5(木)', 9),
  ('2026-03-08', NULL, '3/8(日)', 10),
  ('2026-03-10', NULL, '3/10(火)', 11),
  ('2026-03-15', NULL, '3/15(日)', 12),
  ('2026-03-16', NULL, '3/16(月)', 13),
  ('2026-03-18', NULL, '3/18(水)', 14),
  ('2026-03-19', NULL, '3/19(木)', 15),
  ('2026-03-20', NULL, '3/20(金)', 16),
  ('2026-03-21', NULL, '3/21(土)', 17),
  ('2026-03-23', NULL, '3/23(月)', 18);
