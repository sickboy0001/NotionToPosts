import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

/**
 * Notionデータベースから公開フラグが true のレコードを取得
 */
export async function getPublishedArticles(databaseId, options = {}) {
  const { testMode = false, limit = null } = options;

  try {
    let hasMore = true;
    let startCursor = undefined;
    const articles = [];

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          or: [
            {
              property: 'Published',
              checkbox: {
                equals: true
              }
            },
            {
              property: 'Commit',
              checkbox: {
                equals: true
              }
            }
          ]
        },
        sorts: [
          {
            timestamp: 'last_edited_time',
            direction: 'descending'
          }
        ],
        start_cursor: startCursor
      });

      articles.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;

      // テストモード時は最初のページのみ取得
      if (testMode) break;
    }

    // リミット適用
    if (limit) {
      return articles.slice(0, limit);
    }

    return articles;
  } catch (error) {
    console.error('Failed to fetch articles from Notion:', error);
    throw error;
  }
}

/**
 * Notionページからメタデータを抽出
 */
export function extractMetadata(page) {
  const properties = page.properties;
  
  return {
    id: page.id,
    title: properties.Title?.title?.[0]?.plain_text || '',
    slug: properties.Slug?.rich_text?.[0]?.plain_text || '',
    emoji: properties.Emoji?.select?.name || '📝',
    type: properties.Type?.select?.name || 'tech',
    topics: properties.Topics?.multi_select?.map(t => t.name) || [],
    platforms: properties.Platform?.multi_select?.map(p => p.name) || [],
    published: properties.Published?.checkbox || false,
    commit: properties.Commit?.checkbox || false,
    lastEditedTime: page.last_edited_time,
    createdTime: page.created_time
  };
}

/**
 * ページIDから完全な内容を取得
 */
export async function getPageContent(pageId) {
  try {
    const page = await notion.blocks.retrieve({
      block_id: pageId
    });
    return page;
  } catch (error) {
    console.error(`Failed to fetch page content for ${pageId}:`, error);
    throw error;
  }
}
