# ビジネス協同委員会 専用Webアプリ

行田商工会議所青年部 ビジネス協同委員会の、初回顔合わせ日程調整と稼働アンケート用のWebアプリです。

## 機能

- **回答ページ（/）**
  - 委員長挨拶・委員会の簡単な説明のあと、アンケートへ
  - 名前をプルダウンで選択
  - 初回顔合わせの候補日をタップで選択（複数可）
  - 参加しにくい曜日・時間帯、忙しい時期をタップで回答
  - 実施してほしいセミナー・学びたいこと（複数可）、講義希望、その他コメント
  - 送信するとDBに保存

- **委員向けページ（/board）** ※スマホでも閲覧しやすい
  - スケジュール（会議・例会・締切の予定）
  - 議事録（委員会議事メモ・決定事項）
  - 共有資料・連絡事項（リンク・お知らせ）
  - 委員に `/board` のURLを共有すると、いつでも確認可能

- **管理者用（/admin）**
  - **ダッシュボード**：各管理への入口
  - **スケジュール**：予定の追加・編集・削除
  - **議事録**：議事メモの追加・編集・削除
  - **共有資料・連絡**：資料リンク・お知らせの管理
  - **意見・アイデア**：例会テーマ案・やりたいことのストック（採用/見送り等のステータス管理）
  - **アンケート集計**：初回顔合わせ・稼働アンケートの集計
  - **委員・候補日**：委員一覧・顔合わせ候補日（初期データ投入ボタンあり）

## セットアップ

### 1. Supabase でプロジェクト作成

1. [Supabase](https://supabase.com) でアカウント作成し、New Project でプロジェクトを作成
2. プロジェクトの **Settings > API** から以下をコピー:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. DBスキーマの投入

Supabase ダッシュボードの **SQL Editor** で以下を順に実行してください。

1. **`supabase/schema.sql`** … 委員・候補日・アンケート用テーブル（members, meeting_candidates 等）
2. **`supabase/schema_schedule_minutes_materials_ideas.sql`** … スケジュール・議事録・共有資料・意見用テーブル（schedule_events, minutes, shared_materials, ideas）

2 を実行すると、管理者の「スケジュール」「議事録」「共有資料・連絡」「意見・アイデア」および委員向け `/board` が利用可能になります。

### 3. 顔合わせ候補日が「0件」のとき（SQLは不要）

**毎回SQLを叩く必要はありません。** 候補日が0件のときは、**管理者ページ（/admin）の「顔合わせ候補日一覧」で「候補日を初期データで投入」ボタン**を押すと、2月・3月の18日分が一括で入ります。Supabase の SQL Editor は使いません。  
（テーブルやカラムを作る**初回だけ** `schema.sql` やマイグレーションの SQL を実行します。）

### 4. 既存DBに新項目を追加した場合（マイグレーション）

すでに `schema.sql` でDBを作成済みの場合は、**SQL Editor で `supabase/migration_add_fields_and_seed.sql` の Step 1 だけ実行**してください（コメント・セミナー希望・講義希望・参加しにくい曜日/時間帯のカラムが追加されます）。委員の差し替えや候補日の一括投入は、同じファイルの Step 2・Step 3 を必要に応じて実行します。

### 5. 環境変数

```bash
cp .env.local.example .env.local
```

`env.example` に書いている 2 つの変数を、`.env.local`（ローカル）または Vercel の Environment Variables（本番）に設定してください。

### 6. 起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開き、回答ページで動作確認してください。管理者用は http://localhost:3000/admin です。

## 委員の追加

Supabase の **Table Editor** で `members` テーブルを開き、行を追加するか、SQL で:

```sql
INSERT INTO members (name, role, sort_order) VALUES ('氏名', '委員', 10);
```

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)

## デプロイ（GitHub → Vercel）

**GitHub リポジトリの作成と Vercel 連携の手順は [GITHUB_VERCEL_SETUP.md](./GITHUB_VERCEL_SETUP.md) にまとめてあります。**

1. GitHub で新規リポジトリを作成（README なしで作成）
2. このフォルダで `git remote add origin <あなたのリポジトリURL>` のあと `git push -u origin main`
3. Vercel で「Import Project」→ そのリポジトリを選択 → 環境変数を設定 → Deploy

管理者用は同じドメインの `/admin`、委員向け情報は `/board` です。必要に応じて認証やパスワード保護を追加してください。
