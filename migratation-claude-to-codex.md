# Transformation de plugin Claude Code -> Codex

## Support

| Feature    | Claude | Codex  |
| ---------- | ------ | ------ |
| agents     |   ✅   |   ✅   |  
| commands   |   ✅   |   🚫   |
| hooks      |   ✅   |   ✅   |
| MCP        |   ✅   |   ✅   |
| skills     |   ✅   |   ✅   |


## Structure 

Dossier : `my-plugin/`

| Claude                       | Codex                        |
| ---------------------------- | ---------------------------- |
| .claude-plugin/plugin.json   | .codex-plugin/plugin.json    |
| .mcp.json                    | .mcp.json                    | 
| hooks/                       | hooks/                       |
| hooks/hooks.json             | hooks/hooks.json             |
| scripts/                     | scripts/                     |
| skills/*/name/SKILL.md       | skills/*/name/SKILL.md       |


## Mapper les concepts

| Claude                 | Codex              |
| ---------------------- | ------------------ |
| CLAUDE.md              | AGENTS.md          |
| ${CLAUDE_PLUGIN_ROOT}  | ${PLUGIN_ROOT}     |
| ${CLAUDE_PLUGIN_DATA}  | ${PLUGIN_DATA}     |


## MCP Defintion

- **Claude** :
```json
{
  "mcpServers": {
    "erom-slack-mcp": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "${CASERNE_SLACK_MCP_SERVER}"],
      "env": {
        "SLACK_BOT_TOKEN": "${CLAUDE_SLACK_BOT_TOKEN}"
      }
    },
    "erom-cortex-mcp": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "${CASERNE_VAULT_MCP_SERVER}"]
    }
  }
}

```

- **Codex** :
```json
{
  "mcpServers": {
    "erom-slack-mcp": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "${CASERNE_SLACK_MCP_SERVER}"],
      "env": {
        "SLACK_BOT_TOKEN": "${CODEX_SLACK_BOT_TOKEN}"
      }
    },
    "erom-cortex-mcp": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "${CASERNE_VAULT_MCP_SERVER}"]
    }
  }
}
```


## Mapper les Skill / Frontmatter YAML

- **Claude**
```yaml
---
name: name
description: description
model: sonnet
color: cyan
user-invocable: true
disable-model-invocation: true
disallowedTools: Write, Edit, NotebookEdit
memory: user
---
```

- **Codex** :
```yaml
---
description: description
color: "#008B8B"     
---
```
