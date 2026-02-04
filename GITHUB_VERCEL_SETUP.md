# GitHub リポジトリ作成 & Vercel デプロイ手順

このドキュメントに沿って、committee-app を GitHub に上げて Vercel で公開します。

---

## 1. GitHub で新しいリポジトリを作る

1. [GitHub](https://github.com) にログイン
2. 右上 **+** → **New repository**
3. 設定例:
   - **Repository name**: `gyoda-yeg-committee-app`（任意の名前でOK）
   - **Description**: 行田YEG ビジネス協同委員会 専用Webアプリ
   - **Public** を選択
   - **Add a README file** は **つけない**（既に README があるため）
4. **Create repository** をクリック
5. 作成後、表示される **リポジトリのURL** をコピー（例: `https://github.com/あなたのユーザー名/gyoda-yeg-committee-app.git`）

---

## 2. このフォルダを Git リポジトリにして GitHub に push する

ターミナルで **committee-app フォルダ** に移動してから実行してください。

```bash
cd /Users/m/Workspace/mirai/00_knowledge/community/行田YEG/committee-app

# まだ git 初期化していない場合
git init
git add .
git commit -m "Initial commit: ビジネス協同委員会 専用Webアプリ"

# メインブランチ名を main に
git branch -M main

# あなたのリポジトリURLに置き換えてください
git remote add origin https://github.com/あなたのユーザー名/gyoda-yeg-committee-app.git

# 初回 push
git push -u origin main
```

- **すでに親フォルダで git 管理している場合**  
  `committee-app` だけを別リポジトリにしたいときは、いったん `committee-app` を別の空フォルダにコピーし、その中で `git init` から上記を実行しても構いません。
- **SSH を使う場合**  
  `git remote add origin git@github.com:あなたのユーザー名/gyoda-yeg-committee-app.git` のように SSH URL にしてください。

---

## 3. Vercel に接続する

1. [Vercel](https://vercel.com) にログイン（GitHub アカウントで連携すると楽です）
2. **Add New…** → **Project**
3. **Import Git Repository** で、さきほど push した **gyoda-yeg-committee-app** を選択
4. **Configure Project** で:
   - **Framework Preset**: Next.js のまま
   - **Root Directory**: そのまま（`./`）
   - **Build Command**: `npm run build` のまま
   - **Environment Variables** を追加（リポジトリの `env.example` を参照）:
     - `NEXT_PUBLIC_SUPABASE_URL` = Supabase の Project URL（例: `https://xxxxx.supabase.co`）
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase の anon public key  
     - ※ 値は **Supabase ダッシュボード → Settings → API** からコピー。または、mirai プロジェクト内の `00_knowledge/settings/credentials/supabase_gyoda_yeg.md`（行田YEG用）に記載の「API用」を参照。
5. **Deploy** をクリック

ビルドが終わると、`https://○○○.vercel.app` のような URL で公開されます。

---

## 4. 本番で使う URL の例

| 用途           | URL 例                          |
|----------------|----------------------------------|
| 委員向けアンケート | `https://○○○.vercel.app/`       |
| 委員向け情報     | `https://○○○.vercel.app/board`  |
| 管理者         | `https://○○○.vercel.app/admin` |

Vercel の **Project Settings → Domains** で、独自ドメインも設定できます。

---

## 5. 注意事項

- **環境変数**（Supabase の URL と anon key）は Vercel の **Environment Variables** に必ず設定してください。設定しないと本番で DB に接続できません。
- `.env.local` は `.gitignore` に入っているため、Git には含まれません。Vercel には手動で上記 2 つを登録する必要があります。
- 今後の更新は、同じリポジトリに `git push` するだけで、Vercel が自動で再デプロイします。
