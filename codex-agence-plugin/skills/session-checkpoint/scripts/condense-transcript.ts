#!/usr/bin/env bun
// Condense un transcript Claude ou Codex (.jsonl) en markdown "dialogue pur".
// Pur + déterministe, zéro LLM : garde les messages user/assistant,
// réduit les tool calls à un marqueur, tronque les gros résultats,
// jette la plomberie (snapshots, token counts, metadata, etc.).

import { readdir, readFile, realpath, stat } from "fs/promises";
import { homedir } from "os";
import { join, resolve } from "path";

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

type TranscriptCandidate = {
  path: string;
  mtimeMs: number;
};

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max) + "…";
}

function resultToString(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((b: any) =>
        typeof b === "string"
          ? b
          : typeof b?.text === "string"
            ? b.text
            : JSON.stringify(b),
      )
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
  return `${truncate(s, INLINE_THRESHOLD)}\n[result: ${s.length} c - tronqué]`;
}

function renderBlock(block: Block): string | null {
  switch (block.type) {
    case "text":
    case "input_text":
    case "output_text":
      return typeof block.text === "string" ? block.text : null;
    case "thinking":
      return typeof block.thinking === "string" ? `> [thinking] ${block.thinking}` : null;
    case "tool_use":
      return `[tool: ${block.name ?? "?"}(${truncate(JSON.stringify(block.input ?? {}), TOOL_INPUT_MAX)})]`;
    case "tool_result":
      return condenseResult(block.content);
    case "image":
    case "input_image":
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

function renderClaudeLine(obj: any): string | null {
  if (obj?.type !== "user" && obj?.type !== "assistant") return null;
  const role = (obj.message?.role ?? obj.type).toString().toUpperCase();
  const body = renderContent(obj.message?.content);
  return body.trim() ? `## ${role}\n\n${body}` : null;
}

function renderCodexResponseItem(payload: any): string | null {
  switch (payload?.type) {
    case "message": {
      if (payload.role !== "user" && payload.role !== "assistant") return null;
      const body = renderContent(payload.content);
      return body.trim() ? `## ${payload.role.toUpperCase()}\n\n${body}` : null;
    }
    case "function_call": {
      const args =
        typeof payload.arguments === "string"
          ? payload.arguments
          : JSON.stringify(payload.arguments ?? {});
      return `[tool: ${payload.name ?? "?"}(${truncate(args, TOOL_INPUT_MAX)})]`;
    }
    case "function_call_output":
      return condenseResult(payload.output);
    case "reasoning": {
      const summary = Array.isArray(payload.summary)
        ? payload.summary
            .map((item: any) => item?.text)
            .filter((text: unknown): text is string => typeof text === "string")
            .join("\n")
        : "";
      return summary.trim() ? `> [reasoning] ${summary}` : null;
    }
    default:
      return null;
  }
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

    const rendered =
      obj?.type === "response_item"
        ? renderCodexResponseItem(obj.payload)
        : renderClaudeLine(obj);

    if (rendered?.trim()) out.push(rendered);
  }
  return out.join("\n\n");
}

async function collectJsonlFiles(dir: string): Promise<TranscriptCandidate[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const out: TranscriptCandidate[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectJsonlFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      const info = await stat(path);
      out.push({ path, mtimeMs: info.mtimeMs });
    }
  }
  return out;
}

async function normalizePath(path: string) {
  try {
    return await realpath(path);
  } catch {
    return resolve(path);
  }
}

async function readSessionMeta(path: string) {
  const raw = await readFile(path, "utf-8");
  for (const line of raw.split("\n").slice(0, 50)) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj?.type === "session_meta") return obj.payload ?? {};
    } catch {
      // ignore malformed metadata lines
    }
  }
  return {};
}

export async function findCodexTranscript(options: {
  cwd?: string;
  codexHome?: string;
  sessionId?: string;
} = {}) {
  const cwd = await normalizePath(options.cwd ?? process.cwd());
  const codexHome = options.codexHome ?? process.env.CODEX_HOME ?? join(homedir(), ".codex");
  const sessionId = options.sessionId ?? process.env.CODEX_SESSION_ID ?? process.env.CODEX_THREAD_ID;
  const sessionsDir = join(codexHome, "sessions");
  const candidates = (await collectJsonlFiles(sessionsDir)).sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (sessionId) {
    for (const candidate of candidates) {
      const meta = await readSessionMeta(candidate.path);
      if (meta.id === sessionId || candidate.path.includes(sessionId)) return candidate.path;
    }
  }

  for (const candidate of candidates) {
    const meta = await readSessionMeta(candidate.path);
    if (typeof meta.cwd !== "string") continue;
    if ((await normalizePath(meta.cwd)) === cwd) return candidate.path;
  }

  return candidates[0]?.path ?? "";
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  if (args.includes("--print-codex-transcript")) {
    const transcript = await findCodexTranscript({
      cwd: get("--cwd"),
      codexHome: get("--codex-home"),
      sessionId: get("--session-id"),
    });
    if (transcript) console.log(transcript);
    process.exit(transcript ? 0 : 1);
  }

  const inPath = get("--in");
  const outPath = get("--out");
  if (!inPath || !outPath) {
    console.error("usage: bun condense-transcript.ts --in <path.jsonl> --out <path.md>");
    console.error("   or: bun condense-transcript.ts --print-codex-transcript --cwd <cwd> [--codex-home <dir>]");
    process.exit(1);
  }

  const raw = await readFile(inPath, "utf-8");
  await Bun.write(outPath, condense(raw));
  console.error(`condensed ${inPath} → ${outPath}`);
}
