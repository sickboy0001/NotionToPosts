# Notion-to-TechBlog Sync

Notionを執筆エディタとし、GitHub ActionsでZennおよびQiitaへ記事を自動同期・公開するシステムです。

## 📋 機能

- **Notion Database連携**: 公開フラグが有効な記事を自動取得
- **Markdown変換**: Notion記事を自動的にMarkdownに変換
- **フロントマター生成**: Zenn/Qiita各プラットフォーム向けのYAMLフロントマターを自動生成
- **画像処理**: Notion内の画像を自動ダウンロード・相対パス置換
- **複数プラットフォーム対応**: 記事ごとにZenn/Qiita投稿先を指定可能
- **GitHub Actions自動化**: 定期実行または手動トリガーでの同期
- **差分検出**: 変更がある場合のみコミット・プッシュ

## 🚀 クイックスタート

### 1. リポジトリの準備

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/notion-to-techblog-sync
cd notion-to-techblog-sync

# 依存パッケージをインストール
npm install
```

### 2. 環境設定

`.env.example` をコピーして `.env` ファイルを作成：

```bash
cp .env.example .env
```

`.env` に以下の値を設定：

```env
# Notion API
NOTION_TOKEN=your_notion_api_token
NOTION_DATABASE_ID=your_database_id

# Qiita API
QIITA_TOKEN=your_qiita_token

# オプション
TEST_MODE=false
LIMIT_ARTICLES=
```

### 3. Notionトークンの取得

1. [Notion Integration](https://www.notion.so/my-integrations) にアクセス
2. 「Create new integration」をクリック
3. 統合に名前を付けて「Submit」
4. 「Internal Integration Secret」をコピーして `NOTION_TOKEN` に貼付

### 4. Notionデータベースの準備

以下のプロパティを持つNotionデータベースを作成：

| プロパティ名 | 型 | 説明 |
|-----------|-----|------|
| Title | Title | 記事タイトル（必須） |
| Slug | Rich Text | ファイル名/URLスラッグ（必須） |
| Emoji | Select | Zenn用アイコン（例：🚀） |
| Type | Select | `tech` または `idea`（Zenn用） |
| Topics | Multi-Select | タグ/トピック（複数可） |
| Published | Checkbox | 公開フラグ（ONの記事のみ同期） |
| Platform | Multi-Select | `Zenn`, `Qiita`（投稿先を指定） |

### 5. プライベートモード無効化

作成したNotionの統合をデータベースに共有：

1. Notionデータベースを開く
2. 右上の「Share」 → 「Integrations」
3. 先ほど作成した統合を選択して追加

## 💻 ローカル実行

### 全記事を同期

```bash
npm run sync
```

### テストモード（1記事のみ）

```bash
npm run sync:test
```

### 記事数を制限

```bash
npm run sync -- --limit 3
```

## 📁 ディレクトリ構成

```
notion-to-techblog-sync/
├── .github/
│   └── workflows/
│       └── sync-notion.yml          # GitHub Actions ワークフロー
├── scripts/
│   └── sync-notion.js               # メインスクリプト
├── src/
│   └── utils/
│       ├── notion.js                # Notion API ユーティリティ
│       ├── markdown.js              # Markdown変換・フロントマター生成
│       └── file.js                  # ファイル操作ユーティリティ
├── articles/                        # Zenn記事出力先
├── public/                          # Qiita記事出力先
├── images/                          # ダウンロード画像保存先
├── .env.example                     # 環境変数テンプレート
├── .gitignore
├── package.json
└── README.md
```

## 🔄 GitHub Actions設定

### Secrets の設定

GitHubリポジトリ設定ページで以下のSecretsを追加：

- `NOTION_TOKEN`: Notion API トークン
- `NOTION_DATABASE_ID`: NotionデータベースID
- `QIITA_TOKEN`: Qiita APIトークン

### ワークフロー実行

**手動実行（リポジトリ > Actions > Sync Notion to Zenn/Qiita > Run workflow）**

**定期実行（毎日午前0時UTC = 午前9時JST）**

スケジュールは [.github/workflows/sync-notion.yml](.github/workflows/sync-notion.yml) の `schedule` セクションで変更可能。

## 📝 使用例

### Zenn 専用記事

NotionでPlatformに「Zenn」のみ選択

```yaml
---
title: "Node.jsの基本"
emoji: "📚"
type: "tech"
topics: ["nodejs", "javascript"]
published: true
---

# 本文...
```

### Qiita 専用記事

NotionでPlatformに「Qiita」のみ選択

```yaml
---
title: "Pythonチュートリアル"
tags: ["python", "programming"]
updated_at: "2024-01-15T10:00:00Z"
id: "python-tutorial"
private: false
---

# 本文...
```

### 両プラットフォーム投稿

NotionでPlatformに「Zenn」と「Qiita」を両方選択

## 🐛 トラブルシューティング

### エラー: NOTION_TOKEN and NOTION_DATABASE_ID are required

`.env` ファイルが存在するか、値が正しく設定されているか確認してください。

```bash
# 確認コマンド
echo $NOTION_TOKEN
echo $NOTION_DATABASE_ID
```

### エラー: API request failed

- Notion API トークンの有効期限確認
- データベースアクセス権確認（統合が共有されているか）
- ネットワーク接続確認

### 記事が同期されない

- Notion内の「Published」チェックボックスが有効か確認
- 「Slug」プロパティが空でないか確認
- 「Platform」に「Zenn」または「Qiita」が選択されているか確認

## 🛠 開発

### 依存パッケージ

```bash
npm install
```

### Linting

```bash
npm run lint
```

### ウォッチモード

```bash
npm run dev
```

## 📄 ライセンス

MIT License

## 🤝 貢献

バグ報告や機能リクエストはIssueでお願いします。
Pull Requestも歓迎します。

## 📞 サポート

問題が発生した場合は、[GitHubのIssues](https://github.com/yourusername/notion-to-techblog-sync/issues)でお知らせください。

---

**注意**: `.env` ファイルに機密情報を含むため、**必ず `.gitignore` に追加されていることを確認してください**。
