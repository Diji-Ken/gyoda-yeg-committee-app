-- ビジネス協同委員会 専用Webアプリ DBスキーマ
-- Supabase ダッシュボードの SQL Editor で実行してください。

-- 委員会メンバー
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 顔合わせ・会議の候補日
CREATE TABLE IF NOT EXISTS meeting_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_date DATE NOT NULL,
  time_slot TEXT,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 候補日への回答（誰がいつ参加できるか）
CREATE TABLE IF NOT EXISTS meeting_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  meeting_candidate_id UUID NOT NULL REFERENCES meeting_candidates(id) ON DELETE CASCADE,
  can_attend BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, meeting_candidate_id)
);

-- 稼働アンケート（曜日・時間帯・忙しい時期・コメント・セミナー希望・講義希望）
CREATE TABLE IF NOT EXISTS availability_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  free_weekdays TEXT[] DEFAULT '{}',
  busy_weekdays TEXT[] DEFAULT '{}',
  free_time_zones TEXT[] DEFAULT '{}',
  busy_time_zones TEXT[] DEFAULT '{}',
  busy_month_period TEXT[] DEFAULT '{}',
  free_comment TEXT,
  seminar_wishes JSONB DEFAULT '{"selected":[],"other":""}',
  lecture_person_wish TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id)
);

-- RLS（Row Level Security）: 一旦無効で全読み書き可能。本番ではポリシーを設定
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for meeting_candidates" ON meeting_candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for meeting_responses" ON meeting_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for availability_responses" ON availability_responses FOR ALL USING (true) WITH CHECK (true);

-- 初期データ: 委員会メンバー（ビジネス協同委員会の全員・名前のみ）
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
ON CONFLICT (name) DO NOTHING;

-- 顔合わせ候補日（2月・3月）
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
