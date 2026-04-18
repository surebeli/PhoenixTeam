/**
 * PhoenixTeam Notion MCP Server — Reference Implementation
 *
 * A Model Context Protocol server that bridges Notion pages/databases
 * with PhoenixTeam's phoenix-import skill.
 *
 * Prerequisites:
 *   npm install @modelcontextprotocol/sdk @notionhq/client
 *
 * Usage:
 *   NOTION_API_KEY=ntn_xxx node index.js
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client } from "@notionhq/client";

// --- Config ---
const NOTION_API_KEY = process.env.NOTION_API_KEY;
if (!NOTION_API_KEY) {
  console.error("Error: NOTION_API_KEY environment variable is required.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

// --- Block → Markdown Converter ---

function richTextToMd(richTexts) {
  return richTexts
    .map((rt) => {
      let text = rt.plain_text || "";
      if (rt.annotations?.bold) text = `**${text}**`;
      if (rt.annotations?.italic) text = `*${text}*`;
      if (rt.annotations?.code) text = `\`${text}\``;
      if (rt.annotations?.strikethrough) text = `~~${text}~~`;
      if (rt.href) text = `[${text}](${rt.href})`;
      return text;
    })
    .join("");
}

async function blockToMarkdown(block, indent = "") {
  const type = block.type;
  const data = block[type];
  let md = "";

  switch (type) {
    case "paragraph":
      md = `${indent}${richTextToMd(data.rich_text)}\n`;
      break;
    case "heading_1":
      md = `# ${richTextToMd(data.rich_text)}\n`;
      break;
    case "heading_2":
      md = `## ${richTextToMd(data.rich_text)}\n`;
      break;
    case "heading_3":
      md = `### ${richTextToMd(data.rich_text)}\n`;
      break;
    case "bulleted_list_item":
      md = `${indent}- ${richTextToMd(data.rich_text)}\n`;
      break;
    case "numbered_list_item":
      md = `${indent}1. ${richTextToMd(data.rich_text)}\n`;
      break;
    case "to_do":
      md = `${indent}- [${data.checked ? "x" : " "}] ${richTextToMd(data.rich_text)}\n`;
      break;
    case "code":
      md = `\`\`\`${data.language || ""}\n${richTextToMd(data.rich_text)}\n\`\`\`\n`;
      break;
    case "quote":
      md = `${indent}> ${richTextToMd(data.rich_text)}\n`;
      break;
    case "callout":
      const emoji = data.icon?.emoji || "💡";
      md = `> ${emoji} ${richTextToMd(data.rich_text)}\n`;
      break;
    case "divider":
      md = "---\n";
      break;
    case "toggle":
      md = `> **${richTextToMd(data.rich_text)}**\n`;
      break;
    case "image":
      const url = data.type === "external" ? data.external?.url : data.file?.url;
      const caption = data.caption?.length ? richTextToMd(data.caption) : "image";
      md = `![${caption}](${url})\n`;
      break;
    case "bookmark":
      md = `[${data.url}](${data.url})\n`;
      break;
    case "table":
      // Handled separately via children
      break;
    case "child_page":
      md = `\n### 📄 ${data.title}\n`;
      break;
    default:
      md = `<!-- Unsupported Notion block: ${type} -->\n`;
  }

  // Recurse into children
  if (block.has_children && type !== "child_page") {
    const children = await notion.blocks.children.list({ block_id: block.id });
    for (const child of children.results) {
      md += await blockToMarkdown(child, indent + "  ");
    }
  }

  return md;
}

async function pageToMarkdown(pageId, includeChildren = false) {
  // Fetch page metadata
  const page = await notion.pages.retrieve({ page_id: pageId });
  const titleProp = Object.values(page.properties).find((p) => p.type === "title");
  const title = titleProp?.title?.map((t) => t.plain_text).join("") || "Untitled";
  const lastEdited = page.last_edited_time;

  let md = `# ${title}\n\n`;
  md += `> _Imported from Notion | Last edited: ${lastEdited}_\n\n`;

  // Fetch all blocks
  let cursor;
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    for (const block of response.results) {
      md += await blockToMarkdown(block);
    }
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return md;
}

// --- MCP Server Setup ---

const server = new Server(
  { name: "phoenix-notion-connector", version: "0.1.0" },
  { capabilities: { resources: {}, tools: {} } }
);

// --- Tools ---

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "notion_read_page",
      description:
        "Fetch a Notion page and convert to Markdown for PhoenixTeam import.",
      inputSchema: {
        type: "object",
        properties: {
          page_id_or_url: { type: "string", description: "Notion page ID or URL" },
          include_child_pages: { type: "boolean", default: false },
        },
        required: ["page_id_or_url"],
      },
    },
    {
      name: "notion_list_database",
      description: "List entries in a Notion database.",
      inputSchema: {
        type: "object",
        properties: {
          database_id_or_url: { type: "string" },
          max_results: { type: "integer", default: 50 },
        },
        required: ["database_id_or_url"],
      },
    },
    {
      name: "notion_search",
      description: "Search across Notion pages and databases.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          max_results: { type: "integer", default: 20 },
        },
        required: ["query"],
      },
    },
  ],
}));

function extractPageId(input) {
  // Handle full Notion URLs
  const urlMatch = input.match(/([a-f0-9]{32}|[a-f0-9-]{36})$/i);
  if (urlMatch) return urlMatch[1].replace(/-/g, "");
  return input.replace(/-/g, "");
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "notion_read_page": {
      const pageId = extractPageId(args.page_id_or_url);
      const md = await pageToMarkdown(pageId, args.include_child_pages);
      return { content: [{ type: "text", text: md }] };
    }

    case "notion_list_database": {
      const dbId = extractPageId(args.database_id_or_url);
      const response = await notion.databases.query({
        database_id: dbId,
        page_size: args.max_results || 50,
      });
      const entries = response.results.map((page) => {
        const titleProp = Object.values(page.properties).find((p) => p.type === "title");
        return {
          title: titleProp?.title?.map((t) => t.plain_text).join("") || "Untitled",
          page_id: page.id,
          last_edited: page.last_edited_time,
          url: page.url,
        };
      });
      return { content: [{ type: "text", text: JSON.stringify(entries, null, 2) }] };
    }

    case "notion_search": {
      const response = await notion.search({
        query: args.query,
        page_size: args.max_results || 20,
      });
      const results = response.results.map((item) => ({
        type: item.object,
        id: item.id,
        title: item.object === "page"
          ? Object.values(item.properties).find((p) => p.type === "title")?.title?.map((t) => t.plain_text).join("") || "Untitled"
          : item.title?.[0]?.plain_text || "Untitled",
        url: item.url,
        last_edited: item.last_edited_time,
      }));
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// --- Resources ---

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "notion://recent",
      name: "Recent Notion Pages",
      description: "List recently edited pages",
      mimeType: "application/json",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "notion://recent") {
    const response = await notion.search({ sort: { direction: "descending", timestamp: "last_edited_time" }, page_size: 10 });
    const pages = response.results.filter((r) => r.object === "page").map((p) => ({
      id: p.id, url: p.url, last_edited: p.last_edited_time,
    }));
    return { contents: [{ uri: request.params.uri, mimeType: "application/json", text: JSON.stringify(pages, null, 2) }] };
  }
  throw new Error(`Unknown resource: ${request.params.uri}`);
});

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PhoenixTeam Notion MCP Server running on stdio");
}

main().catch(console.error);
