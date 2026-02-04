-- スケジュール・議事録・共有資料・意見・アイデア用テーブル
-- 既存DBに追加する場合は Supabase SQL Editor で実行

-- スケジュール（行事予定）
CREATE TABLE IF NOT EXISTS schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  place TEXT,
  memo TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 議事録
CREATE TABLE IF NOT EXISTS minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  minute_date DATE,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 共有資料・連絡事項（notice=本文のみ / link=URL / file=ファイルURL）
CREATE TABLE IF NOT EXISTS shared_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'notice',
  url TEXT,
  body TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 意見・アイデア（委員や会議で出たものをストック）
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source TEXT DEFAULT 'other',
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for schedule_events" ON schedule_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for minutes" ON minutes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for shared_materials" ON shared_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for ideas" ON ideas FOR ALL USING (true) WITH CHECK (true);
