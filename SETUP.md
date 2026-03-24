# セットアップガイド

Notion-to-TechBlog Sync システムの初期セットアップ手順です。

## 前提条件

- Node.js v20 以上
- npm または yarn
- Notionアカウント
- GitHub アカウント
- Zenn アカウント（オプション）
- Qiita アカウント（オプション）

## ステップバイステップガイド

### Step 1: Notion Integration の作成

1. **Notion Integrations ページにアクセス**
   - https://www.notion.so/my-integrations にアクセス

2. **新しいIntegrationを作成**
   - 「Create new integration」「新しいインテグレーション」をクリック
   - 名前を入力（例：「TechBlog Sync」）
   - 「Submit」をクリック

3. **API Token をコピー**
   - 「Internal Integration Secret」「内部インテグレーションシークレット」をコピー
   - `.env` ファイルの `NOTION_TOKEN` に貼付

### Step 2: Notionデータベースの準備

1. **新しいデータベースを作成**
   - Notion内で新しいページを作成
   - 「Database」として設定

2. **プロパティを追加**

   | プロパティ名 | 型 | 必須 | 説明 |
   |------------|-----|------|------|
   | Title | Title | ✓ | 記事タイトル |
   | Slug | Rich Text | ✓ | URLスラッグ（`my-article-title` など） |
   | Emoji | Select | - | 絵文字（例：🚀, 📚, 🎯） |
   | Type | Select | - | `tech` / `idea` |
   | Topics | Multi-Select | - | タグ（複数選択可） |
   | Published | Checkbox | - | 公開フラグ |
   | Platform | Multi-Select | ✓ | `Zenn` / `Qiita` |

3. **Integration をデータベースに共有**
   - データベース右上の「Share」をクリック
   - 下部の「Integrations」を展開
   - Step 1で作成した Integration を追加

4. **Database ID をコピー**
   - ブラウザのURLから `?v=` より前の部分が Database ID
   - 例：`https://www.notion.so/abcd1234efgh5678ijkl...?v=xyz...` → `abcd1234efgh5678ijkl...`
   - `.env` の `NOTION_DATABASE_ID` に貼付

### Step 3: Zenn の設定

1. **Zenn アカウント作成**
   - https://zenn.dev にアクセス
   - GitHub で登録

2. **GitHub リポジトリの準備**
   ```bash
   # Zenn 専用リポジトリ（推奨）または
   # 別ブランチを使用
   git checkout -b zenn-articles
   ```

3. **Zenn CLI のインストール**（オプション、ローカルプレビュー用）
   ```bash
   npm install -g zenn-cli
   ```

### Step 4: Qiita の設定

1. **Qiita アカウント作成**
   - https://qiita.com にアクセス
   - 登録

2. **API トークンを取得**
   - アカウント設定 > API トークン
   - 新しいトークンを生成
   - `.env` の `QIITA_TOKEN` に貼付

3. **Qiita CLI のセットアップ**
   ```bash
   npm install -D qiita-cli
   # または
   npx qiita-cli login
   ```

### Step 5: GitHub Actions の設定

1. **GitHub Secrets に値を追加**
   - リポジトリ > Settings > Secrets and variables > Actions
   - 以下を追加：
     - `NOTION_TOKEN`
     - `NOTION_DATABASE_ID`
     - `QIITA_TOKEN` （Qiita を使用する場合）

2. **ワークフローを有効化**
   - `.github/workflows/sync-notion.yml` が自動的に有効化される

3. **実行確認**
   - Actions タブでワークフロー実行状況を確認

## テスト実行

### ローカルでテスト

```bash
# 環境変数を確認
cat .env

# 1記事のみ同期テスト
npm run sync:test

# 特定数の記事で同期
npm run sync -- --limit 3
```

### ワークフロー実行

1. GitHub リポジトリ > Actions
2. 「Sync Notion to Zenn/Qiita」を選択
3. 「Run workflow」をクリック

## トラブルシューティング

### 問題：「Integration not found」エラー

**原因**: Integration がデータベースに共有されていない

**解決**:
1. Notion データベース > Share > Integrations で Integration を追加

### 問題：「Database not found」エラー

**原因**: `NOTION_DATABASE_ID` が正しくない

**解決**:
1. Notion > データベースを開く
2. ブラウザURL から ID を確認
3. `.env` に正しい ID を設定

### 問題：「Slug プロパティが見つかりません」

**原因**: Notion データベースに Slug プロパティがない

**解決**:
1. Notion > データベース > プロパティを追加
2. 「Slug」を Rich Text として作成

### 記事が出力されない

**チェックリスト**:
- [ ] 「Published」チェックボックスが有効か
- [ ] 「Slug」に値が入っているか
- [ ] 「Platform」に Zenn/Qiita が選択されているか
- [ ] NOTION_TOKEN が有効か

## よくある質問

### Q: 既存記事を保護したい

**A**: Notion の Slug に既存のファイル名（拡張子なし）を入力してください。同じ Slug を持つ記事は上書きされます。

### Q: 記事を非公開にしたい

**A**: Notion で Published チェックボックスを OFF にしてください。次の同期で無視されます。

### Q: 複数のブログに同じ記事を投稿したい

**A**: Notion の Platform に Zenn と Qiita の両方を選択してください。

### Q: 画像が正常に処理されない

**A**: 
- Notion 内でサポートされた形式か確認（PNG, JPG, GIF など）
- ネットワーク接続を確認
- ダウンロード失敗時は警告が表示されます

## 次のステップ

- [ ] Notion で最初の記事を作成
- [ ] Published チェックを有効化
- [ ] Platform を選択
- [ ] ローカルで `npm run sync:test` でテスト実行
- [ ] Git に commit & push
- [ ] GitHub Actions で実行確認
- [ ] Zenn/Qiita で記事が公開されたか確認

---

**サポートが必要な場合:** README.md の「トラブルシューティング」セクションも参照してください。
