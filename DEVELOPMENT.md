# 開発ガイド

このドキュメントは、Notion-to-TechBlog Sync システムの開発を行う開発者向けです。

## プロジェクト構造

```
src/
├── utils/
│   ├── notion.js       # Notion API 操作
│   ├── markdown.js    # Markdown 変換・フロントマター生成
│   └── file.js        # ファイル操作
scripts/
└── sync-notion.js     # メインスクリプト
```

## 主要な関数

### notion.js

#### `getPublishedArticles(databaseId, options)`
Notionデータベースから公開フラグが true のレコードを取得します。

```javascript
const articles = await getPublishedArticles(databaseId, {
  testMode: false,  // テストモード
  limit: 10        // 件数制限（null で無制限）
});
```

**返り値**: Notion Page オブジェクトの配列

#### `extractMetadata(page)`
Notion ページからメタデータを抽出します。

```javascript
const metadata = extractMetadata(page);
// {
//   id: "page-id",
//   title: "記事タイトル",
//   slug: "article-slug",
//   emoji: "🚀",
//   type: "tech",
//   topics: ["tag1", "tag2"],
//   platforms: ["Zenn", "Qiita"],
//   published: true,
//   lastEditedTime: "2024-01-15T10:00:00Z",
//   createdTime: "2024-01-01T00:00:00Z"
// }
```

### markdown.js

#### `convertToMarkdown(pageId)`
Notion ページを Markdown に変換します。

```javascript
const markdown = await convertToMarkdown(pageId);
```

#### `generateZennFrontmatter(metadata)`
Zenn 用フロントマターを生成します。

```javascript
const frontmatter = generateZennFrontmatter({
  title: "記事タイトル",
  emoji: "🚀",
  type: "tech",
  topics: ["nodejs", "javascript"],
  published: true
});
// ---
// title: "記事タイトル"
// emoji: "🚀"
// type: "tech"
// topics: ["nodejs", "javascript"]
// published: true
// ---
```

#### `generateQiitaFrontmatter(metadata)`
Qiita 用フロントマターを生成します。

#### `extractImageUrls(markdown)`
Markdown 内の画像URL を抽出します。

```javascript
const images = extractImageUrls(markdown);
// [
//   {
//     url: "https://...",
//     alt: "画像説明",
//     fullMatch: "![画像説明](https://...)"
//   }
// ]
```

### file.js

#### `writeFile(filePath, content)`
ファイルを書き込みます（ディレクトリ自動作成）。

```javascript
await writeFile('./articles/my-article.md', content);
```

#### `downloadImage(imageUrl, outputPath)`
画像をダウンロードします。

```javascript
await downloadImage('https://...', './images/image.png');
```

#### `generateFileName(slug)`
スラッグからセーフなファイル名を生成します。

```javascript
const fileName = generateFileName('my-article-title');
// my-article-title.md
```

## 追加機能の実装

### 新しいユーティリティ関数を追加

1. `src/utils/` に新しいファイルを作成
2. 関数をエクスポート
3. `scripts/sync-notion.js` でインポート

例：Metadata のバリデーション

```javascript
// src/utils/validation.js
export function validateMetadata(metadata) {
  const errors = [];
  
  if (!metadata.title) errors.push('Title is required');
  if (!metadata.slug) errors.push('Slug is required');
  if (metadata.topics.length === 0) {
    errors.push('At least one topic is required');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### エラーハンドリング

既存のエラーハンドリングパターン：

```javascript
try {
  const result = await someOperation();
  console.log('✓ Success');
} catch (error) {
  console.error('✗ Error:', error.message);
  // エラーをスキップまたは再スロー
}
```

## テスト実行方法

### 単一記事のテスト

```bash
npm run sync:test
```

### 複数記事のテスト

```bash
npm run sync -- --limit 5
```

### ローカルデバッグ

```bash
# ウォッチモード
npm run dev

# または
node --inspect scripts/sync-notion.js
```

### ロギング

コード内に `console.log()` / `console.error()` を追加：

```javascript
console.log('📚 Fetching articles...');
console.error('❌ Something went wrong:', error);
```

## 環境変数

開発時は `.env` ファイルで設定：

```env
NOTION_TOKEN=your_token
NOTION_DATABASE_ID=your_id
QIITA_TOKEN=your_token
TEST_MODE=true
LIMIT_ARTICLES=1
```

## パフォーマンス最適化

### ページネーション

`getPublishedArticles()` はページネーションをサポート：

```javascript
// 自動的にすべてのページを取得
const allArticles = await getPublishedArticles(databaseId);

// テストモードでは最初のページのみ
const testArticles = await getPublishedArticles(databaseId, {
  testMode: true
});
```

### 並列処理

複数記事の処理を並列化（FYI - 現在は逐次処理）：

```javascript
// 実装例
await Promise.all(articles.map(article => processArticle(article)));
```

### キャッシング

最終編集時刻でスキップ（未実装 - 拡張可能）：

```javascript
if (lastSyncTime && pageLastEditedTime <= lastSyncTime) {
  console.log('Already synced, skipping...');
  continue;
}
```

## デバッグのコツ

### Notion API レスポンスを確認

```javascript
console.log(JSON.stringify(article, null, 2));
```

### 生成された Markdown を確認

```javascript
console.log('Generated Markdown:');
console.log(markdown);
```

### ファイルシステム操作を確認

```javascript
import fs from 'fs';
console.log(fs.readdirSync('./articles'));
```

## 貢献ガイドライン

1. **フォークしたリポで開発**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **コミットメッセージの規約**
   - `feat: 新機能の追加`
   - `fix: バグ修正`
   - `docs: ドキュメント更新`
   - `refactor: コード整理`

3. **Pull Request 作成**
   - 詳細な説明を記載
   - テスト結果を含める

## 既知の制限事項

1. **API レートリミット**
   - Notion API: 3 requests/second
   - Qiita API: 調査予定

2. **ファイルサイズ**
   - 最大アップロードサイズ: 確認予定

3. **並列処理**
   - 現在は逐次処理のため、多数の記事処理に時間がかかる場合あり

## TODO - 今後の改善案

- [ ] 並列処理による高速化
- [ ] キャッシング機構
- [ ] 差分同期機能
- [ ] ドライランモード
- [ ] ユニットテスト
- [ ] E2E テスト
- [ ] 設定ファイル（config.json）
- [ ] ロギング設定
- [ ] メトリクス収集

---

**質問や提案については、GitHub Issues でお願いします。**
