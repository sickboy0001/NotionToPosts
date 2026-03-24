# API Reference

## Notion API Integration

### notionClient.databases.query()

**Purpose**: Query articles from Notion database

**Endpoint**: `POST /v1/databases/{database_id}/query`

**Filter Example**:
```javascript
{
  database_id: process.env.NOTION_DATABASE_ID,
  filter: {
    property: 'Published',
    checkbox: {
      equals: true
    }
  },
  sorts: [
    {
      property: 'Last Edited Time',
      direction: 'descending'
    }
  ]
}
```

**Response**:
```javascript
{
  results: [
    {
      id: "page-uuid",
      properties: {
        Title: { title: [{ plain_text: "Article Title" }] },
        Slug: { rich_text: [{ plain_text: "article-slug" }] },
        // ...other properties
      },
      last_edited_time: "2024-01-15T10:00:00Z"
    }
  ],
  has_more: false,
  next_cursor: null
}
```

### notionClient.blocks.retrieve()

**Purpose**: Get page content blocks

**Response**: Block structure with children

## Notion Property Types

| Property | Type | Example |
|----------|------|---------|
| Title | title | `{ title: [{ plain_text: "Content" }] }` |
| Slug | rich_text | `{ rich_text: [{ plain_text: "slug-value" }] }` |
| Emoji | select | `{ select: { name: "🚀" } }` |
| Type | select | `{ select: { name: "tech" } }` |
| Topics | multi_select | `{ multi_select: [{ name: "topic1" }, ...] }` |
| Published | checkbox | `{ checkbox: true }` |
| Platform | multi_select | `{ multi_select: [{ name: "Zenn" }, ...] }` |

## Markdown Output Formats

### Zenn Frontmatter

```yaml
---
title: "Article Title"
emoji: "🚀"
type: "tech"
topics: ["topic1", "topic2"]
published: true
---
```

**Type Options**: `"tech"` | `"idea"`

### Qiita Frontmatter

```yaml
---
title: "Article Title"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
updated_at: "2024-01-15T10:00:00Z"
id: "article-slug"
private: false
---
```

**Notes**: 
- Maximum 5 tags
- `id` field used for Qiita sync tracking
- `updated_at` automatically generated

## Image Handling

### Supported Formats
- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WebP (.webp)

### Path Replacement

**Before**:
```markdown
![Description](https://example.com/image.png)
```

**After**:
```markdown
![Description](../images/image.png)
```

## Error Messages

### Notion API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid_grant` | Token expired | Regenerate integration token |
| `unauthorized` | Wrong token | Verify NOTION_TOKEN in .env |
| `not_found` | Wrong database ID | Double-check NOTION_DATABASE_ID |
| `forbidden` | Integration not shared | Share integration with database |

### Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `NOTION_TOKEN required` | Missing env var | Set in .env or system variables |
| `Slug is required` | Missing property | Add Slug value in Notion |
| `No articles found` | No published items | Set Published = true in Notion |

## API Rate Limits

### Notion API
- **Rate Limit**: 3 requests per second
- **Burst**: Up to 10 requests
- **Retry-After**: Check response headers

### Qiita API
- **Rate Limit**: Depends on account type
- **Documentation**: https://help.qiita.com/ja/articles/qiita-api-v2

## Example: Custom Filtering

Adding a date filter:

```javascript
filter: {
  and: [
    {
      property: 'Published',
      checkbox: { equals: true }
    },
    {
      property: 'Last Edited Time',
      date: {
        after: '2024-01-01'
      }
    }
  ]
}
```

## GitHub Actions Secrets

These are encrypted environment variables for workflows:

```yaml
env:
  NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
  NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
  QIITA_TOKEN: ${{ secrets.QIITA_TOKEN }}
```

**Setting Secrets**:
1. Go to Repository Settings
2. Secrets and variables > Actions
3. Add new repository secret
4. Enter name and value

---

For more details, visit:
- Notion API: https://developers.notion.com/reference
- Zenn Docs: https://zenn.dev/articles
- Qiita API: https://qiita.com/api/v2/docs
