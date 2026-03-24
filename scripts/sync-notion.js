#!/usr/bin/env node

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPublishedArticles, extractMetadata } from '../src/utils/notion.js';
import { convertToMarkdown, generateZennFrontmatter, generateQiitaFrontmatter, extractImageUrls, replaceImagePaths } from '../src/utils/markdown.js';
import { writeFile, downloadImage, generateFileName, sanitizeFileName, readFile } from '../src/utils/file.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数の取得
const { NOTION_TOKEN, NOTION_DATABASE_ID, TEST_MODE, LIMIT_ARTICLES } = process.env;

// CLIオプションの解析
const args = process.argv.slice(2);
let testMode = TEST_MODE === 'true' || args.includes('--test-mode');
let limitArticles = LIMIT_ARTICLES ? parseInt(LIMIT_ARTICLES) : null;

if (args.includes('--limit')) {
  const limitIndex = args.indexOf('--limit');
  if (limitIndex < args.length - 1) {
    limitArticles = parseInt(args[limitIndex + 1]);
  }
}

// ディレクトリ設定
const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(__dirname, '..', 'images');

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Starting Notion to Zenn/Qiita sync...\n');

  // 環境変数確認
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.error('❌ Error: NOTION_TOKEN and NOTION_DATABASE_ID are required');
    console.error('Please set them in .env file or environment variables');
    process.exit(1);
  }

  if (testMode) {
    console.log('📝 Test mode enabled - will process only 1 article\n');
  }

  try {
    // ステップ1: Notionから公開記事を取得
    console.log('📚 Fetching published articles from Notion...');
    const articles = await getPublishedArticles(NOTION_DATABASE_ID, {
      testMode,
      limit: limitArticles || (testMode ? 1 : null)
    });

    if (articles.length === 0) {
      console.log('ℹ️  No published articles found');
      return;
    }

    console.log(`✓ Found ${articles.length} article(s)\n`);

    let zennCount = 0;
    let qiitaCount = 0;
    const results = [];

    // ステップ2: 各記事を処理
    for (const article of articles) {
      const metadata = extractMetadata(article);

      if (!metadata.slug) {
        console.warn(`⚠️  Skipping article "${metadata.title}" - no slug defined`);
        continue;
      }

      console.log(`\n📄 Processing: ${metadata.title}`);
      console.log(`   Slug: ${metadata.slug}`);
      console.log(`   Platforms: ${metadata.platforms.join(', ') || 'None'}`);

      try {
        // Markdownに変換
        const markdown = await convertToMarkdown(article.id);

        // 画像を処理
        const imageUrls = extractImageUrls(markdown);
        const imageDownloads = [];

        if (imageUrls.length > 0) {
          console.log(`   Found ${imageUrls.length} image(s)`);

          for (const image of imageUrls) {
            const rawName = path.basename(new URL(image.url).pathname);
            const decodedName = (() => {
              try {
                return decodeURIComponent(rawName);
              } catch {
                return rawName;
              }
            })();
            const fileName = sanitizeFileName(decodedName || rawName || 'image');
            const imagePath = path.join(IMAGES_DIR, fileName);

            console.log(`   ⚙ image original URL: ${image.url}`);
            console.log(`   ⚙ image filename: ${fileName}`);

            const success = await downloadImage(image.url, imagePath);
            if (success) {
              const cleanUrl = image.url.split('?')[0];
              imageDownloads.push({ url: image.url, urlNoQuery: cleanUrl, path: imagePath });
            }
          }
        }

        function buildImageMapping(targetFilePath) {
          return imageDownloads.reduce((map, entry) => {
            const relative = path.relative(path.dirname(targetFilePath), entry.path).replace(/\\/g, '/');
            const safeRelative = relative.startsWith('.') ? relative : `./${relative}`;
            const baseName = path.basename(entry.path); // saved file name
            const pathFromImages = `../images/${baseName}`;
            const pathFromRoot = `/images/${baseName}`;

            const urlWithoutQuery = entry.urlNoQuery || entry.url;
            const encodedName = path.basename(urlWithoutQuery);
            const decodedName = (() => {
              try { return decodeURIComponent(encodedName); } catch { return encodedName; }
            })();

            map[entry.url] = safeRelative;
            if (entry.urlNoQuery) map[entry.urlNoQuery] = safeRelative;
            map[urlWithoutQuery] = safeRelative;
            map[encodedName] = safeRelative;
            map[decodedName] = safeRelative;
            map[pathFromImages] = safeRelative;
            map[pathFromRoot] = safeRelative;
            map[baseName] = safeRelative;

            return map;
          }, {});
        }

        // Zennに投稿する場合
        if (metadata.platforms.includes('Zenn')) {
          const zennContent = generateZennFrontmatter(metadata) + replaceImagePaths(markdown, buildImageMapping(path.join(ARTICLES_DIR, generateFileName(metadata.slug))));
          const fileName = generateFileName(metadata.slug);
          const filePath = path.join(ARTICLES_DIR, fileName);

          await writeFile(filePath, zennContent);
          zennCount++;
          results.push({ platform: 'Zenn', title: metadata.title, file: fileName });
        }

        // Qiitaに投稿する場合
        if (metadata.platforms.includes('Qiita')) {
          const qiitaContent = generateQiitaFrontmatter(metadata) + replaceImagePaths(markdown, buildImageMapping(path.join(PUBLIC_DIR, generateFileName(metadata.slug))));
          const fileName = generateFileName(metadata.slug);
          const filePath = path.join(PUBLIC_DIR, fileName);

          await writeFile(filePath, qiitaContent);
          qiitaCount++;
          results.push({ platform: 'Qiita', title: metadata.title, file: fileName });
        }


      } catch (error) {
        console.error(`   ✗ Error processing article: ${error.message}`);
        results.push({ 
          platform: 'Error', 
          title: metadata.title, 
          error: error.message 
        });
      }
    }

    // 結果表示
    console.log('\n\n📊 Sync Summary');
    console.log('═'.repeat(50));
    console.log(`Total processed: ${articles.length}`);
    console.log(`Zenn articles: ${zennCount}`);
    console.log(`Qiita articles: ${qiitaCount}`);
    console.log('═'.repeat(50));

    if (results.length > 0) {
      console.log('\n📋 Details:');
      results.forEach(result => {
        if (result.error) {
          console.log(`  ✗ ${result.platform}: ${result.title}`);
          console.log(`    Error: ${result.error}`);
        } else {
          console.log(`  ✓ ${result.platform}: ${result.title}`);
          console.log(`    File: ${result.file}`);
        }
      });
    }

    console.log('\n✅ Sync completed successfully!');

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// 実行
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
