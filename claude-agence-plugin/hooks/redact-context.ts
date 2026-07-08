#!/usr/bin/env bun
import { redact, type Tier } from "./redact-rules.ts";
import { currentTiers } from "./redact-state.ts";

// Sorties susceptibles de véhiculer un secret : shell, fichiers, recherche, web, retours
// d'agent, ET tous les tools MCP (mcp__* — get_mail/read_thread peuvent porter des tokens).
function shouldRedact(tool: string): boolean {
  return (
    tool === "Bash" || tool === "Read" || tool === "Grep" ||
    tool === "WebFetch" || tool === "Agent" || tool === "Task" ||
    tool.startsWith("mcp__")
  );
}

const raw = await Bun.stdin.text();

let input: { tool_name?: string; tool_response?: unknown };
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

if (!input.tool_name || !shouldRedact(input.tool_name)) process.exit(0);

// tool_response est généralement un OBJET ({ stdout, stderr, ... } pour Bash,
// { file: { content, ... } } pour Read). On rédige récursivement toutes les
// valeurs string en préservant la forme d'origine (Claude Code accepte un
// updatedToolOutput de même type que le tool_response — vérifié en live).
let count = 0;
function redactDeep(value: unknown, tiers: Tier[]): unknown {
  if (typeof value === "string") {
    const r = redact(value, tiers);
    count += r.count;
    return r.text;
  }
  if (Array.isArray(value)) return value.map((v) => redactDeep(v, tiers));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = redactDeep(v, tiers);
    return out;
  }
  return value;
}

const redacted = redactDeep(input.tool_response, currentTiers());
if (count === 0) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      updatedToolOutput: redacted,
    },
  }),
);
