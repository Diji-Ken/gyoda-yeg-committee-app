-- 委員会メンバー全15名を members に反映（不足分のみ追加・既存は sort_order のみ更新）
-- Supabase の SQL Editor で実行してください。既存の回答データは消えません。

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
  ('野本純志', NULL, 15)
ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order;
