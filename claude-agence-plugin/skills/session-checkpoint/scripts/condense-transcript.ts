#!/usr/bin/env bun
// Condense un transcript Claude Code (.jsonl) en markdown "dialogue pur".
// Pur + déterministe, zéro LLM : garde text/thinking + messages user,
// réduit les tool_use à un marqueur, tronque les gros tool_result,
// jette la plomberie (attachment, snapshots, modes, etc.).

const TOOL_INPUT_MAX = 200;
const INLINE_THRESHOLD = 500;
const RESULT_HEAD = 5;
const RESULT_TAIL = 2;

type Block = {
  type: string;
  text?: string;
  thinking?: string;
  name?: string;
  input?: unknown;
  content?: unknown;
};

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max) + "…";
}

// Normalise un content de tool_result (string | array de blocs | autre) en string brute.
function resultToString(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((b: any) => (typeof b === "string" ? b : typeof b?.text === "string" ? b.text : JSON.stringify(b)))
      .join("\n");
  }
  return content == null ? "" : JSON.stringify(content);
}

function condenseResult(content: unknown): string {
  const s = resultToString(content);
  if (s.length <= INLINE_THRESHOLD) return s;
  const lines = s.split("\n");
  if (lines.length > RESULT_HEAD + RESULT_TAIL) {
    const head = lines.slice(0, RESULT_HEAD).join("\n");
    const tail = lines.slice(-RESULT_TAIL).join("\n");
    return `${head}\n[result: ${lines.length} lignes, ${s.length} c - tronqué]\n${tail}`;
  }
  // Peu de lignes mais longues → tronquer par caractères.
  return `${truncate(s, INLINE_THRESHOLD)}\n[result: ${s.length} c - tronqué]`;
}

function renderBlock(block: Block): string | null {
  switch (block.type) {
    case "text":
      return typeof block.text === "string" ? block.text : null;
    case "thinking":
      return typeof block.thinking === "string" ? `> [thinking] ${block.thinking}` : null;
    case "tool_use":
      return `[tool: ${block.name ?? "?"}(${truncate(JSON.stringify(block.input ?? {}), TOOL_INPUT_MAX)})]`;
    case "tool_result":
      return condenseResult(block.content);
    case "image":
      return "[image]";
    default:
      return null;
  }
}

function renderContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((b) => renderBlock(b as Block))
      .filter((x): x is string => x != null && x !== "")
      .join("\n\n");
  }
  return "";
}

export function condense(jsonl: string): string {
  const out: string[] = [];
  for (const line of jsonl.split("\n")) {
    if (!line.trim()) continue;
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      continue; // ligne malformée → skip
    }
    if (obj?.type !== "user" && obj?.type !== "assistant") continue;
    const role = (obj.message?.role ?? obj.type).toString().toUpperCase();
    const body = renderContent(obj.message?.content);
    if (!body.trim()) continue;
    out.push(`## ${role}\n\n${body}`);
  }
  return out.join("\n\n");
}

// --- CLI ---
if (import.meta.main) {
  (async () => {
    const args = process.argv.slice(2);
    const get = (flag: string) => {
      const i = args.indexOf(flag);
      return i >= 0 ? args[i + 1] : undefined;
    };
    const inPath = get("--in");
    const outPath = get("--out");
    if (!inPath || !outPath) {
      console.error("usage: bun condense-transcript.ts --in <path.jsonl> --out <path.md>");
      process.exit(1);
    }
    const raw = await Bun.file(inPath).text();
    await Bun.write(outPath, condense(raw));
    console.error(`condensed ${inPath} → ${outPath}`);
  })();
}
