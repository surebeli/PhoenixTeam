---
name: phoenix-import
short-description: "Import external docs via MCP/HTTP"
description: "Import design documents from external sources (Notion, Figma, linear, etc.) via MCP connectors into the local .phoenix/design/ directory. Use this to sync external context into the Git-native workflow."
user-invocable: true
argument-hint: "[source_url or mcp_resource_id]"
triggers: [phoenix-parse]
callable-by: []
estimated-tokens:
  context: 2500
  skill: 500
  data-read: variable
  output: 400
  total: ~3400+ (plus ~4700 for auto-triggered parse)
---

# Skill: import

Fetch external documents (via MCP or HTTP) and normalize them into the PhoenixTeam local workspace.

## Parameters

- `$ARGUMENTS`: The source URL (e.g., Notion page link) or MCP resource URI.

## Execution Steps

### Step 1 — Identity & pre-flight
1. Read `git config phoenix.member-code` to determine current identity `{code}`. Apply identity guard.
2. Run `git status` and display the result.

### Step 2 — Fetch Content
1. If `$ARGUMENTS` is empty, output:
   ```
   ⚠️ 请提供外部文档的链接或 MCP 资源 ID。例如：/phoenix-import https://notion.so/my-design-doc
   ```
   Stop execution.
2. Use available tools (e.g., MCP readResource, web fetch, or API calls) to retrieve the content of the specified `$ARGUMENTS`.
3. Convert the fetched content into Markdown format.

### Step 3 — Normalize and Save
1. Generate a descriptive filename based on the content title (e.g., `notion-auth-design.md`).
2. Prepend the `<!-- Phoenix Normalized Document -->` header and metadata (Source URL, Import Date).
3. Save the file to `.phoenix/design/{code}/{filename}`.

### Step 4 — Commit and Next Steps
1. Run `git add .phoenix/design/{code}/{filename}`.
2. Commit with message: `"[PhoenixTeam] import — {code} imported external doc {filename}"`
3. Automatically trigger `/phoenix-parse` to update the `INDEX.md`.
4. Output:
   ```
   ✅ 外部文档已成功导入到 .phoenix/design/{code}/{filename}
   建议下一步：运行 /phoenix-review 检查该文档与其他提案是否存在分歧。
   ```
