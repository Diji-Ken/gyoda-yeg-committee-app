-- アンケート設定（管理画面で編集可能）
-- Supabase SQL Editor で実行。既存の members / meeting_candidates 等はそのまま利用します。

CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  deadline_at DATE,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for surveys" ON surveys FOR ALL USING (true) WITH CHECK (true);

-- 1件だけ「今回のアンケート」として登録（既存データがあればスキップ）
INSERT INTO surveys (name, deadline_at, is_open)
SELECT '初回顔合わせ・稼働アンケート', '2026-02-10'::DATE, true
WHERE NOT EXISTS (SELECT 1 FROM surveys LIMIT 1);
