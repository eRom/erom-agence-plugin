#!/usr/bin/env bun
// Condense un transcript Gemini / Antigravity (.jsonl) en markdown "dialogue pur".
// Pur + déterministe, zéro LLM : garde text/thinking + messages user,
// réduit les tool_use à un marqueur, tronque les gros tool_result,
// jette la plomberie (attachment, snapshots, modes, etc.).

const TOOL_INPUT_MAX = 200;
const INLINE_THRESHOLD = 500;
const RESULT_HEAD = 5;
const RESULT_TAIL = 1;



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
  let lines = s.split("\n");
  lines = lines.filter(line => {
    const l = line.trim();
    if (l.includes("grounding-api-redirect")) return false;
    if (/^\[\d+\]\s+\[.*\]\(https?:\/\//.test(l)) return false;
    return true;
  });
  const filtered = lines.join("\n");
  if (filtered.length <= INLINE_THRESHOLD) return filtered;

  if (lines.length > RESULT_HEAD + RESULT_TAIL) {
    const head = lines.slice(0, RESULT_HEAD).join("\n");
    const tail = lines.slice(-RESULT_TAIL).join("\n");
    return `${head}\n[result: ${lines.length} lignes, ${filtered.length} c - tronqué]\n${tail}`;
  }
  return `${truncate(filtered, INLINE_THRESHOLD)}\n[result: ${filtered.length} c - tronqué]`;
}

function formatToolArgs(args: unknown): string {
  if (args == null || typeof args !== "object") return "";
  const parts: string[] = [];
  const entries = Object.entries(args as Record<string, unknown>);

  for (const [key, val] of entries) {
    if (key === "toolAction" || key === "toolSummary") continue;

    let formattedVal = "";
    if (key === "CodeContent" || key === "ArtifactMetadata") {
      const len = typeof val === "string" ? val.length : JSON.stringify(val ?? "").length;
      formattedVal = `<${len} c>`;
    } else {
      let stringVal = typeof val === "string" ? val : JSON.stringify(val ?? "");
      if (stringVal.startsWith('"') && stringVal.endsWith('"') && stringVal.length >= 2) {
        stringVal = stringVal.slice(1, -1);
      }
      formattedVal = truncate(stringVal, 100);
    }
    parts.push(`${key}=${formattedVal}`);
  }
  return parts.join(", ");
}

export function condense(jsonl: string): string {
  const out: string[] = [];
  for (const line of jsonl.split("\n")) {
    if (!line.trim()) continue;
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }

    if (obj.type === "USER_INPUT" && obj.content && typeof obj.content === "string") {
      const cleanContent = obj.content
        .replace(/<USER_REQUEST>[\s\S]*?<\/USER_REQUEST>/g, (m: string) => m.replace(/<\/?USER_REQUEST>/g, ""))
        .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, "")
        .replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, "")
        .trim();

      if (cleanContent) {
        out.push(`## USER\n\n${cleanContent}`);
      }
    }
    else if (obj.type === "PLANNER_RESPONSE") {
      let body = "";
      if (obj.thinking && typeof obj.thinking === "string") {
        body += `> [thinking] ${obj.thinking.trim()}\n\n`;
      }
      if (obj.content && typeof obj.content === "string") {
        body += obj.content.trim();
      }
      if (obj.tool_calls && Array.isArray(obj.tool_calls) && obj.tool_calls.length > 0) {
        const tools = obj.tool_calls
          .map((tc: any) => `[tool: ${tc.name ?? "?"}(${formatToolArgs(tc.args)})]`)
          .filter((t: string) => t !== "")
          .join("\n");
        if (tools) {
          body += (body ? "\n\n" : "") + tools;
        }
      }

      if (body.trim()) {
        out.push(`## ASSISTANT\n\n${body.trim()}`);
      }
    }
    else if (obj.source === "MODEL" && obj.type !== "PLANNER_RESPONSE" && obj.status === "DONE") {
      if (obj.content) {
        const condensed = condenseResult(obj.content);
        if (condensed.trim()) {
          out.push(condensed.trim());
        }
      }
    }
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
