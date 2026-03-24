「Notion → GitHub → Zenn/Qiita」の自動連携システムですね。RooCodeやGeminiに精度の高いコードを生成させるための、**要件定義・技術仕様書**をまとめました。

これをそのままプロンプトとして貼り付けるか、ファイル（`requirements.md` など）として読み込ませてみてください。



---

# システム要件定義書：Notion-to-TechBlog Sync

## 1. 目的
Notionを執筆エディタとし、GitHub Actionsを通じてZennおよびQiitaへ記事を自動同期・公開する仕組みを構築する。

## 2. 全体構成
* **Source**: Notion Database
* **CI/CD**: GitHub Actions (Node.js)
* **Destinations**: 
    * **Zenn**: GitHubリポジトリ連携（`articles/*.md`）
    * **Qiita**: Qiita CLIによるAPI投稿



---

## 3. 技術スタック
* **Runtime**: Node.js (v20+)
* **Libraries**:
    * `@notionhq/client` (Notion API SDK)
    * `notion-to-md` (Markdown conversion)
    * `qiita-cli` (Qiita synchronization)
* **Automation**: GitHub Actions

---

## 4. Notionデータベース仕様
以下のプロパティを持つデータベースを作成・使用する。
* **Title** (title): 記事タイトル
* **Slug** (rich_text): ファイル名およびURLスラッグ（必須）
* **Emoji** (select/text): Zenn用アイコン（例: 🚀）
* **Type** (select): `tech` or `idea` (Zenn用)
* **Topics** (multi_select): タグ/トピック
* **Published** (checkbox): 公開フラグ（ONの記事のみ同期）
* **Platform** (multi_select): `Zenn`, `Qiita`（投稿先の振り分け）

---

## 5. スクリプト機能要件 (sync-notion.js)

### ① 記事取得ロジック
* `Published` が `true` のレコードをクエリ。
* `Last Edited Time` を判定し、更新がある場合のみ処理（または全件上書き許容）。

### ② コンテンツ変換
* `notion-to-md` を使用してMarkdownへ変換。
* **フロントマターの自動生成**:
    * **Zenn用**: `title`, `emoji`, `type`, `topics`, `published` を含むYAML。
    * **Qiita用**: `title`, `tags`, `updated_at`, `id` (Qiita管理用) を含むYAML。

### ③ 画像のローカル保存
* Notion内の画像URLを検知し、`images/` ディレクトリにダウンロード。
* Markdown内の画像パスを相対パス（`../images/filename.png`）に置換。

### ④ ファイル出力
* Zenn用: `articles/{slug}.md`
* Qiita用: `public/{slug}.md`（Qiita CLIの標準構成に従う）

---

## 6. GitHub Actions ワークフロー仕様
* **トリガー**: `workflow_dispatch`（手動）および `schedule`（定期実行）。
* **権限**: `contents: write`（リポジトリへのPush権限）。
* **環境変数**: 
    * `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `QIITA_TOKEN` を GitHub Secrets から読み込み。
* **事後処理**: 
    * Git差分がある場合のみ `git commit & push`。
    * `Platform` に `Qiita` が含まれる場合、`npx qiita publish` を実行。

---

## 7. 既存記事への配慮（マイグレーション）
* 既存記事を上書きしないよう、Notion側の `Slug` プロパティには既存のURLスラッグを正確に入力する運用とする。
* 初回実行時は、まず特定の1記事（テスト用）のみをフィルタリングして実行できるオプションをスクリプトに持たせる。

---

### RooCode への最初の指示案
> 「上記の仕様書に基づき、まずは Notion から記事一覧を取得し、Zenn 形式のフロントマターを付与した Markdown ファイルを `articles/` フォルダに出力する Node.js スクリプト（`scripts/sync-notion.js`）を作成してください。」

このように段階的に指示を出すと、非常にスムーズに構築できるはずです。



次は、**Notion側のデータベースIDやトークンなどの値を実際に取得して、RooCodeに入力する準備**を始めますか？