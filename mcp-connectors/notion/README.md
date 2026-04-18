# PhoenixTeam — Notion MCP Connector

Import Notion pages and databases into your PhoenixTeam workspace via the Model Context Protocol (MCP).

## Overview

This connector enables `phoenix-import` to fetch design documents directly from Notion, converting them to normalized Markdown files in `.phoenix/design/{code}/`.

```
Notion Page → MCP notion_read_page → Markdown → phoenix-import → .phoenix/design/{code}/
```

## Setup

### 1. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Name it `PhoenixTeam`
4. Select your workspace
5. Copy the **Internal Integration Token**

### 2. Share Pages with the Integration

1. Open the Notion page you want to import
2. Click **"..."** → **"Connections"** → **"Add connections"**
3. Select **PhoenixTeam**

### 3. Set the API Key

```bash
export NOTION_API_KEY="ntn_xxxxxxxxxxxxxxxxxxxx"
```

Or add to your MCP client configuration:
```json
{
  "mcpServers": {
    "phoenix-notion": {
      "command": "node",
      "args": ["path/to/phoenix-notion-server/index.js"],
      "env": {
        "NOTION_API_KEY": "ntn_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## Usage with PhoenixTeam

### Import a Notion Page
```
/phoenix-import https://www.notion.so/My-Design-Doc-abc123def456
```

### Import by Page ID
```
/phoenix-import notion://page/abc123def456789012345678901234
```

### Browse a Notion Database First
The connector exposes a `notion_list_database` tool to browse available pages:
```
/phoenix-import notion://database/xyz789...
```

## Tools

| Tool | Description | Input |
|------|-------------|-------|
| `notion_read_page` | Fetch and convert a Notion page to Markdown | `page_id_or_url` (required), `include_child_pages`, `include_comments` |
| `notion_list_database` | List entries in a Notion database | `database_id_or_url` (required), `filter`, `max_results` |
| `notion_search` | Search across all Notion pages/databases | `query` (required), `filter_type`, `max_results` |

## Block Type Conversion

| Notion Block | Markdown Output |
|-------------|-----------------|
| Paragraph | Plain text |
| Heading 1/2/3 | `#` / `##` / `###` |
| Bulleted list | `- Item` |
| Numbered list | `1. Item` |
| To-do | `- [ ]` / `- [x]` |
| Code | ` ```lang ... ``` ` |
| Quote | `> Quote` |
| Callout | `> {emoji} Callout` |
| Table | Markdown table |
| Image | `![caption](url)` |
| Toggle | `> Toggle content` |
| Divider | `---` |
| Child page | Recursed as sub-section |
| Unsupported | `<!-- Unsupported: {type} -->` |

## Architecture

```
connector.json        — MCP resource/tool definitions (declarative)
index.js              — Server implementation (TODO: reference implementation)
                        Uses @notionhq/client SDK + MCP stdio transport
```

## Limitations

- **Inline databases** within pages are exported as simplified tables (no filters/views)
- **File & media blocks** export as links (files are not downloaded into .phoenix/)
- **Synced blocks** are resolved to their source content at fetch time
- **Rate limiting**: Notion API allows 3 requests/second — batch imports should use `max_results` pagination
