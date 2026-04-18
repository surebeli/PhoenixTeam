# PhoenixTeam MCP Connectors

This directory contains Model Context Protocol (MCP) connector definitions for integrating PhoenixTeam with external document sources.

## Available Connectors

| Connector | Status | Description |
|-----------|--------|-------------|
| [Notion](./notion/) | 🟡 Schema defined | Import Notion pages/databases as design documents |
| Figma | ⬜ Planned | Import Figma design specs and component docs |
| Linear | ⬜ Planned | Import Linear issue context as design requirements |
| GitHub Issues | ⬜ Planned | Import GitHub issue discussions as design input |

## How Connectors Work

```
External Source → MCP Connector → Markdown → phoenix-import → .phoenix/design/{code}/
```

1. **Connector** defines MCP resources and tools (in `connector.json`)
2. **`phoenix-import`** calls the connector's tools to fetch content
3. Content is converted to Markdown and normalized with Phoenix headers
4. File is saved to `.phoenix/design/{code}/` and committed

## Creating a New Connector

1. Create a directory: `mcp-connectors/{source-name}/`
2. Define `connector.json` with:
   - `resources`: Read-only data endpoints (URI patterns)
   - `tools`: Executable functions (with JSON Schema input)
   - `authentication`: How to authenticate (bearer, oauth, etc.)
3. Add `README.md` with setup and usage instructions
4. Optionally add a reference server implementation

See [Notion connector](./notion/) for a complete example.

## MCP Protocol Reference

- Spec: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- SDKs: TypeScript, Python, Go, Java, C#, Ruby, Rust
- Transport: `stdio` (local) or Streamable HTTP (remote)
