import { NotionToMarkdown } from 'notion-to-md';
import { Client } from '@notionhq/client';
import path from 'path';

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const n2m = new NotionToMarkdown({ notionClient: notion });

/**
 * NotionページをMarkdownに変換
 */
export async function convertToMarkdown(pageId) {
  try {
    const markdownBlocks = await n2m.pageToMarkdown(pageId);
    const markdownObject = n2m.toMarkdownString(markdownBlocks);

    // parentキーに本記事本文が入る
    const markdown = markdownObject.parent ||
      Object.values(markdownObject).filter(value => typeof value === 'string').join('\n\n');

    if (typeof markdown !== 'string') {
      throw new Error('Could not convert Notion content to markdown string');
    }

    return markdown;
  } catch (error) {
    console.error(`Failed to convert page ${pageId} to markdown:`, error);
    throw error;
  }
}

/**
 * Zenn用フロントマター生成
 */
export function generateZennFrontmatter(metadata) {
  return `---
title: "${metadata.title.replace(/"/g, '\\"')}"
emoji: "${metadata.emoji}"
type: "${metadata.type}"
topics: [${metadata.topics.map(t => `"${t}"`).join(', ')}]
published: ${metadata.published ? 'true' : 'false'}
---

`;
}

/**
 * Qiita用フロントマター生成
 */
export function generateQiitaFrontmatter(metadata) {
  const tags = metadata.topics
    .map(t => t.toLowerCase().replace(/\s+/g, '-'))
    .slice(0, 5); // Qiitaは最大5個まで

  const now = new Date().toISOString();
  const isPrivate = !metadata.published; // publishedがfalseなら private: true

  return `---
title: "${metadata.title.replace(/"/g, '\\"')}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
updated_at: "${now}"
id: "${metadata.slug}"
private: ${isPrivate ? 'true' : 'false'}
---

`;
}

/**
 * Markdown内の画像パスを置換（URLベース）
 */
export function replaceImagePaths(markdown, imageMapping = {}) {
  return markdown.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (match, alt, url) => {
      // 指定URLが直接マッピングされているか
      let imagePath = imageMapping[url];

      if (!imagePath) {
        // URLデコード版を試す
        try {
          const decodedUrl = decodeURIComponent(url);
          imagePath = imageMapping[decodedUrl];
        } catch {
          imagePath = null;
        }
      }

      if (!imagePath) {
        // 0階層パス（ローカル相対パス）をマッピングに合わせて変換
        const basename = path.basename(url);
        if (basename) {
          Object.entries(imageMapping).forEach(([key, value]) => {
            if (path.basename(key) === basename) {
              imagePath = value;
            }
          });
        }
      }

      if (imagePath) {
        return `![${alt}](${imagePath})`;
      }

      return match;
    }
  );
}

/**
 * Notionの画像URLを抽出
 */
export function extractImageUrls(markdown) {
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    const [, alt, url] = match;
    images.push({ url, alt });
  }

  return images;
}
