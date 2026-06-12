import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "fs/promises";
import { basename, dirname, extname, join, relative } from "path";

type GenerateOptions = {
  rootDir?: string;
};

const CLAUDE_PLUGIN_DIR = "claude-agence-plugin";
const CODEX_PLUGIN_DIR = "codex-agence-plugin";

const MODEL_MAPPING: Record<string, string> = {
  haiku: "gpt-5.4-mini",
  sonnet: "gpt-5.4",
  opus: "gpt-5.5",
};

const CLAUDE_ONLY_SKILL_FIELDS = new Set([
  "agent",
  "color",
  "context",
  "disable-model-invocation",
  "disallowedTools",
  "memory",
  "model",
  "user-invocable",
]);

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return {
      fields: new Map<string, string>(),
      body: content,
      hasFrontmatter: false,
    };
  }

  const fields = new Map<string, string>();
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    fields.set(line.slice(0, colonIdx).trim(), line.slice(colonIdx + 1).trim());
  }

  return {
    fields,
    body: content.slice(match[0].length),
    hasFrontmatter: true,
  };
}

function stripQuotes(value: string | undefined) {
  return value?.replace(/^["']|["']$/g, "");
}

function tomlString(value: string) {
  return JSON.stringify(value);
}

function tomlHeredoc(value: string) {
  return `"""\n${value.replace(/"""/g, '\\"\\"\\"')}\n"""`;
}

function transformText(text: string) {
  return text
    .replace(/CLAUDE_SLACK_BOT_TOKEN/g, "CODEX_SLACK_BOT_TOKEN")
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, "${PLUGIN_ROOT}")
    .replace(/CLAUDE_PLUGIN_ROOT/g, "PLUGIN_ROOT")
    .replace(/\$\{CLAUDE_PLUGIN_DATA\}/g, "${PLUGIN_DATA}")
    .replace(/CLAUDE_PLUGIN_DATA/g, "PLUGIN_DATA")
    .replace(/CLAUDECODE=1/g, "CODEX=1")
    .replace(/CLAUDE_CODE_ENTRYPOINT/g, "CODEX")
    .replace(/Claude Code/g, "Codex")
    .replace(/CLAUDE\.md/g, "AGENTS.md")
    .replace(/claude-md/g, "agents-md");
}

function transformMcp(content: string) {
  return JSON.stringify(JSON.parse(transformText(content)), null, 2);
}

function transformPluginManifest(content: string) {
  const source = JSON.parse(content);
  return JSON.stringify(
    {
      name: source.name,
      version: source.version,
      description: source.description,
      interface: {
        displayName: "Caserne",
        shortDescription: "Agence IA sur Codex sessions.",
        longDescription: "",
        developerName: source.author?.name ?? "Romain Ecarnot",
        category: "Productivity",
        capabilities: ["Session continuity", "Kanban mngt"],
        websiteURL: "https://github.com/eRom/erom-agence-plugin",
        defaultPrompt: [""],
        brandColor: "#FFAF5F",
      },
      skills: "./skills/",
      mcpServers: "./.mcp.json",
    },
    null,
    2,
  );
}

function transformAgent(content: string) {
  const { fields, body } = parseFrontmatter(content);
  const name = stripQuotes(fields.get("name")) || "agent";
  const description = stripQuotes(fields.get("description")) || name;
  const rawModel = stripQuotes(fields.get("model")) || "sonnet";
  const mappedModel = MODEL_MAPPING[rawModel] || rawModel;
  const disallowedTools = fields.get("disallowedTools") || "";
  const sandboxMode = /(^|,\s*)(Write|Edit)(\s*,|$)/.test(disallowedTools)
    ? "read-only"
    : "workspace-write";

  return [
    `name = ${tomlString(name)}`,
    `description = ${tomlString(description)}`,
    `model = ${tomlString(mappedModel)}`,
    'model_reasoning_effort = "low"',
    `sandbox_mode = ${tomlString(sandboxMode)}`,
    "",
    `developer_instructions = ${tomlHeredoc(transformText(body).trim())}`,
    "",
  ].join("\n");
}

function transformSkill(content: string) {
  const parsed = parseFrontmatter(content);
  if (!parsed.hasFrontmatter) return transformText(content);

  const frontmatterLines: string[] = [];
  const delegatedAgent = stripQuotes(parsed.fields.get("agent"));

  for (const [key, value] of parsed.fields.entries()) {
    if (CLAUDE_ONLY_SKILL_FIELDS.has(key)) continue;
    frontmatterLines.push(`${key}: ${transformText(value)}`);
  }

  if (!parsed.fields.has("name")) {
    frontmatterLines.unshift("name: unnamed-skill");
  }

  const delegationNotice = delegatedAgent
    ? [
        "",
        "> [!IMPORTANT]",
        `> Codex ne lance pas automatiquement cette skill dans un sous-agent depuis le frontmatter Claude. Si tu es l'agent principal, délègue l'exécution complète au sous-agent \`${delegatedAgent}\`, puis synthétise uniquement son résultat final.`,
        "",
      ].join("\n")
    : "";

  return `---\n${frontmatterLines.join("\n")}\n---\n${delegationNotice}${transformText(parsed.body)}`;
}

function transformCheckpointSkill(content: string) {
  const transformed = transformSkill(content);
  const codexSections = `## 5. Résolution du transcript

\`\`\`bash
SCRIPT="\${PLUGIN_ROOT:-}/skills/session-checkpoint/scripts/condense-transcript.ts"
[ -f "$SCRIPT" ] || SCRIPT="<base dir de ce skill>/scripts/condense-transcript.ts"
CODEX_HOME_DIR="\${CODEX_HOME:-$HOME/.codex}"
TRANSCRIPT="$(bun "$SCRIPT" --print-codex-transcript --cwd "$(pwd -P)" --codex-home "$CODEX_HOME_DIR")"
[ -n "$TRANSCRIPT" ] || { echo "Transcript Codex introuvable dans $CODEX_HOME_DIR/sessions" >&2; exit 1; }
\`\`\`

Cible le transcript Codex local depuis \`$CODEX_HOME/sessions\` (défaut : \`~/.codex/sessions\`). Le script parcourt les \`rollout-*.jsonl\` du plus récent au plus ancien, lit \`session_meta.cwd\`, et choisit le premier transcript dont le cwd réel correspond au repo courant. À défaut, il retombe sur le transcript Codex le plus récent. À résoudre **dans le contexte principal** : lui seul connaît le bon cwd de reprise avant dispatch du scribe.

## 6. Dispatch du scribe

Appelle le subagent \`caserne-scribe\` (outil de sous-agent Codex, agent \`caserne-scribe\`). Passe-lui dans le prompt : le handoff-pointeurs, le path du transcript (étape 5), le path du script \`<base dir de ce skill>/scripts/condense-transcript.ts\`, le dossier \`_sessions_/\` cible, le timestamp \`YYYYMMDD-HH_MM\`, le slug. Il écrit le fichier et te renvoie \`path\` + \`next_step\`.

`;

  return transformed.replace(
    /## 5\. Résolution du transcript[\s\S]*?(?=## 7\. Resume final|$)/,
    codexSections,
  );
}

function codexCondenseTranscriptScript() {
  return `#!/usr/bin/env bun
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
      .join("\\n");
  }
  return content == null ? "" : JSON.stringify(content);
}

function condenseResult(content: unknown): string {
  const s = resultToString(content);
  if (s.length <= INLINE_THRESHOLD) return s;
  const lines = s.split("\\n");
  if (lines.length > RESULT_HEAD + RESULT_TAIL) {
    const head = lines.slice(0, RESULT_HEAD).join("\\n");
    const tail = lines.slice(-RESULT_TAIL).join("\\n");
    return \`\${head}\\n[result: \${lines.length} lignes, \${s.length} c - tronqué]\\n\${tail}\`;
  }
  return \`\${truncate(s, INLINE_THRESHOLD)}\\n[result: \${s.length} c - tronqué]\`;
}

function renderBlock(block: Block): string | null {
  switch (block.type) {
    case "text":
    case "input_text":
    case "output_text":
      return typeof block.text === "string" ? block.text : null;
    case "thinking":
      return typeof block.thinking === "string" ? \`> [thinking] \${block.thinking}\` : null;
    case "tool_use":
      return \`[tool: \${block.name ?? "?"}(\${truncate(JSON.stringify(block.input ?? {}), TOOL_INPUT_MAX)})]\`;
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
      .join("\\n\\n");
  }
  return "";
}

function renderClaudeLine(obj: any): string | null {
  if (obj?.type !== "user" && obj?.type !== "assistant") return null;
  const role = (obj.message?.role ?? obj.type).toString().toUpperCase();
  const body = renderContent(obj.message?.content);
  return body.trim() ? \`## \${role}\\n\\n\${body}\` : null;
}

function renderCodexResponseItem(payload: any): string | null {
  switch (payload?.type) {
    case "message": {
      if (payload.role !== "user" && payload.role !== "assistant") return null;
      const body = renderContent(payload.content);
      return body.trim() ? \`## \${payload.role.toUpperCase()}\\n\\n\${body}\` : null;
    }
    case "function_call": {
      const args =
        typeof payload.arguments === "string"
          ? payload.arguments
          : JSON.stringify(payload.arguments ?? {});
      return \`[tool: \${payload.name ?? "?"}(\${truncate(args, TOOL_INPUT_MAX)})]\`;
    }
    case "function_call_output":
      return condenseResult(payload.output);
    case "reasoning": {
      const summary = Array.isArray(payload.summary)
        ? payload.summary
            .map((item: any) => item?.text)
            .filter((text: unknown): text is string => typeof text === "string")
            .join("\\n")
        : "";
      return summary.trim() ? \`> [reasoning] \${summary}\` : null;
    }
    default:
      return null;
  }
}

export function condense(jsonl: string): string {
  const out: string[] = [];
  for (const line of jsonl.split("\\n")) {
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
  return out.join("\\n\\n");
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
  for (const line of raw.split("\\n").slice(0, 50)) {
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
  console.error(\`condensed \${inPath} → \${outPath}\`);
}
`;
}

async function copyRecursive(
  src: string,
  dest: string,
  transform: (content: string, filePath: string) => string | Promise<string>,
) {
  const stats = await stat(src);
  if (stats.isDirectory()) {
    await ensureDir(dest);
    for (const file of await readdir(src)) {
      if (file === ".DS_Store" || file === ".claude-plugin") continue;
      await copyRecursive(join(src, file), join(dest, file), transform);
    }
    return;
  }

  await ensureDir(dirname(dest));
  if ([".json", ".md", ".sh", ".ts"].includes(extname(src))) {
    const transformed = await transform(await readFile(src, "utf-8"), src);
    await writeFile(dest, transformed, "utf-8");
  } else {
    await copyFile(src, dest);
  }
}

async function copyIfExists(
  src: string,
  dest: string,
  transform: (content: string, filePath: string) => string | Promise<string>,
) {
  try {
    await copyRecursive(src, dest, transform);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }
}

async function generateAgents(claudeDir: string, codexDir: string) {
  const agentsSrcDir = join(claudeDir, "agents");
  const agentsDestDir = join(codexDir, ".codex", "agents");
  await ensureDir(agentsDestDir);

  for (const file of await readdir(agentsSrcDir)) {
    if (extname(file) !== ".md") continue;
    const content = await readFile(join(agentsSrcDir, file), "utf-8");
    const name =
      stripQuotes(parseFrontmatter(content).fields.get("name")) ||
      basename(file, ".md");
    await writeFile(
      join(agentsDestDir, `${name}.toml`),
      transformAgent(content),
      "utf-8",
    );
  }
}

export async function generateCodexPlugin(options: GenerateOptions = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const claudeDir = join(rootDir, CLAUDE_PLUGIN_DIR);
  const codexDir = join(rootDir, CODEX_PLUGIN_DIR);

  await ensureDir(codexDir);

  const manifestSrc = join(claudeDir, ".claude-plugin", "plugin.json");
  await ensureDir(join(codexDir, ".codex-plugin"));
  await writeFile(
    join(codexDir, ".codex-plugin", "plugin.json"),
    transformPluginManifest(await readFile(manifestSrc, "utf-8")),
    "utf-8",
  );

  await writeFile(
    join(codexDir, ".mcp.json"),
    transformMcp(await readFile(join(claudeDir, ".mcp.json"), "utf-8")),
    "utf-8",
  );

  await generateAgents(claudeDir, codexDir);

  await copyIfExists(
    join(claudeDir, "hooks"),
    join(codexDir, "hooks"),
    transformText,
  );
  await copyIfExists(
    join(claudeDir, "scripts"),
    join(codexDir, "scripts"),
    transformText,
  );
  await copyIfExists(
    join(claudeDir, "skills"),
    join(codexDir, "skills"),
    (content, filePath) => {
      if (
        filePath.includes("session-checkpoint") &&
        basename(filePath) === "SKILL.md"
      ) {
        return transformCheckpointSkill(content);
      }
      if (
        filePath.includes("session-checkpoint") &&
        basename(filePath) === "condense-transcript.ts"
      ) {
        return codexCondenseTranscriptScript();
      }

      return basename(filePath) === "SKILL.md"
        ? transformSkill(content)
        : transformText(content);
    },
  );

  console.log(
    `Codex plugin generated in ${relative(rootDir, codexDir) || codexDir}`,
  );
}

if (import.meta.main) {
  await generateCodexPlugin();
}
