# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Notion Database                            │
│  (Title, Slug, Emoji, Type, Topics, Published, Platform)        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow (Daily/Manual)             │
│  ├─ Checkout Repository                                         │
│  ├─ Setup Node.js (v20)                                         │
│  ├─ Install Dependencies                                        │
│  ├─ Run sync-notion.js                                          │
│  ├─ Commit & Push Changes (If diff exists)                      │
│  └─ Publish to Qiita (If needed)                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┬──────────────────────┐
        │                         │                      │
        ▼                         ▼                      ▼
    ┌────────────┐          ┌──────────┐         ┌──────────────┐
    │   Zenn     │          │  Qiita   │         │   GitHub     │
    │ (articles) │          │ (public) │         │  Repository  │
    └────────────┘          └──────────┘         └──────────────┘
```

## Data Flow

1. **Data Fetching**
   - Query Notion Database (Published = true)
   - Extract metadata from each page
   - Filter by platform selection

2. **Content Processing**
   - Convert Notion blocks to Markdown
   - Extract and download images
   - Replace image URLs with relative paths
   - Generate platform-specific frontmatter

3. **Output Generation**
   - Create Markdown files with frontmatter
   - Save in platform-specific directories
   - Update Git repository

4. **Publishing**
   - Commit changes if differences detected
   - Push to GitHub
   - Trigger Qiita CLI publish if needed

## Module Responsibilities

### notion.js
- Notion API communication
- Database querying
- Metadata extraction from Notion pages

### markdown.js
- Markdown conversion
- Frontmatter generation (Zenn/Qiita)
- Image URL handling

### file.js
- File system operations
- Image download
- Directory management

### sync-notion.js
- Orchestration
- Error handling
- Progress reporting

## Configuration

### Environment Variables
- `NOTION_TOKEN`: Notion API authentication
- `NOTION_DATABASE_ID`: Target database identifier
- `QIITA_TOKEN`: Qiita API authentication
- `TEST_MODE`: Single article processing
- `LIMIT_ARTICLES`: Article count limit

### Output Directories
- `articles/`: Zenn markdown files
- `public/`: Qiita markdown files
- `images/`: Downloaded images

## Error Handling Strategy

```
Try-Catch Pattern:
├─ Notion API errors → Log warning, skip article
├─ Markdown conversion errors → Log error, skip article
├─ Image download errors → Log warning, continue
├─ File write errors → Log error, exit
└─ Git operations → Log error, exit
```

## Extensibility Points

1. **New Platforms**
   - Add new frontmatter generator in markdown.js
   - Update metadata extraction
   - Create new output directory

2. **Advanced Filtering**
   - Modify Notion query filter in notion.js
   - Add metadata validation

3. **Custom Transformations**
   - Pre/post processing hooks
   - Custom markdown processors

## Performance Considerations

- **Sequential Processing**: Current implementation (can be parallelized)
- **API Rate Limiting**: Notion 3 req/s limit respected
- **Image Caching**: Not currently implemented
- **Delta Sync**: Checking Last Edited Time only (can be optimized)

## Security

- API tokens stored in environment variables (`.env` not committed)
- GitHub Secrets for Actions workflow
- No sensitive data logged
- Git credentials handled by GitHub Actions
