import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "fs/promises";
import { basename, dirname, extname, join } from "path";

const CLAUDE_DIR = join(process.cwd(), "claude-agence-plugin");
const GEMINI_DIR = join(process.cwd(), "gemini-agence-plugin");

// Mappings des modèles
const MODEL_MAPPING: Record<string, string> = {
  haiku: "google/gemini-3.5-flash",
  sonnet: "google/gemini-3.5-flash",
  opus: "google/gemini-3.1-pro",
};

// Mappings des couleurs CSS simples en Hexa
const COLOR_MAPPING: Record<string, string> = {
  cyan: "#00FFFF",
  purple: "#800080",
  blue: "#0000FF",
  red: "#FF0000",
  green: "#008000",
  yellow: "#FFFF00",
  orange: "#FFA500",
};

function replaceBetween(
  text: string,
  startMarker: string,
  endMarker: string,
  replacement: string,
): string {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return text;
  const endIdx = text.indexOf(endMarker, startIdx + startMarker.length);
  if (endIdx === -1) return text;
  return (
    text.substring(0, startIdx + startMarker.length) +
    replacement +
    text.substring(endIdx)
  );
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function copyRecursive(
  src: string,
  dest: string,
  transform: (content: string, filePath: string) => string | Promise<string>,
) {
  const stats = await stat(src);
  if (stats.isDirectory()) {
    await ensureDir(dest);
    const files = await readdir(src);
    for (const file of files) {
      if (file === ".DS_Store" || file === ".claude-plugin") continue;
      await copyRecursive(join(src, file), join(dest, file), transform);
    }
  } else {
    await ensureDir(dirname(dest));
    const ext = extname(src);
    if ([".md", ".json", ".ts", ".sh"].includes(ext)) {
      const content = await readFile(src, "utf-8");
      const transformed = await transform(content, src);
      await writeFile(dest, transformed, "utf-8");
    } else {
      // Copie binaire brute
      await copyFile(src, dest);
    }
  }
}

// Analyse et conversion d'un agent Markdown
function transformAgent(content: string): string {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return transformText(content);

  const frontmatterRaw = match[1];
  const body = content.substring(match[0].length);

  // Parsing basique et robuste du YAML frontmatter
  const lines = frontmatterRaw.split("\n");
  const fmData: Record<string, string> = {};
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim();
      fmData[key] = val;
    }
  }

  // Construction du nouveau frontmatter
  const newFmLines: string[] = [];

  if (fmData.description) {
    newFmLines.push(`description: ${fmData.description}`);
  }

  newFmLines.push("mode: subagent");

  // Mapping du modèle
  const rawModel = fmData.model?.replace(/['"]/g, "");
  const mappedModel = rawModel
    ? MODEL_MAPPING[rawModel] || rawModel
    : "google/gemini-3.5-flash";
  newFmLines.push(`model: ${mappedModel}`);

  // Mapping de la couleur
  const rawColor = fmData.color?.replace(/['"]/g, "");
  const mappedColor = rawColor
    ? COLOR_MAPPING[rawColor] || rawColor
    : "#008B8B";
  newFmLines.push(`color: "${mappedColor}"`);

  // Mapping des permissions à partir de disallowedTools
  const disallowed = fmData.disallowedTools || "";
  if (disallowed.includes("Write") || disallowed.includes("Edit")) {
    newFmLines.push("permission:");
    newFmLines.push("  write_file: deny");
    newFmLines.push("  read_file: allow");
  } else {
    newFmLines.push("permission:");
    newFmLines.push("  write_file: allow");
    newFmLines.push("  read_file: allow");
  }

  const newFrontmatter = `---\n${newFmLines.join("\n")}\n---`;
  return newFrontmatter + transformText(body);
}

// Transformation globale de texte
function transformText(text: string): string {
  let res = text;
  // Variables d'environnement
  res = res.replace(/CLAUDE_SLACK_BOT_TOKEN/g, "GEMINI_SLACK_BOT_TOKEN");
  res = res.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, "${GEMINI_PLUGIN_ROOT}");
  res = res.replace(/CLAUDE_PLUGIN_ROOT/g, "GEMINI_PLUGIN_ROOT");

  // Remplacements de marqueurs de session si applicable
  res = res.replace(/CLAUDECODE=1/g, "ANTIGRAVITY_AGENT=1");
  res = res.replace(/CLAUDE_CODE_ENTRYPOINT/g, "ANTIGRAVITY_AGENT");

  // Remplacement de CLAUDE.md par GEMINI.md
  res = res.replace(/CLAUDE\.md/g, "GEMINI.md");
  res = res.replace(/claude-md/g, "gemini-md");

  // Remplacement du tiret cadratin en tiret simple (Rule 1)
  res = res.replace(/—/g, "-");

  return res;
}

// Conversion du fichier MCP
function transformMcp(content: string): string {
  const data = JSON.parse(content);
  if (data.mcpServers) {
    for (const key of Object.keys(data.mcpServers)) {
      const server = data.mcpServers[key];
      // Supprimer le type stdio non requis chez Antigravity
      delete server.type;
      // Remplacer dans l'env
      if (server.env) {
        for (const envKey of Object.keys(server.env)) {
          server.env[envKey] = transformText(server.env[envKey]);
        }
      }
      if (server.args) {
        server.args = server.args.map((arg: string) => transformText(arg));
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

async function main() {
  console.log(
    "🚀 Lancement de la génération automatique pour Gemini / Antigravity...",
  );
  await ensureDir(GEMINI_DIR);

  // 1. Générer mcp_config.json à partir de .mcp.json
  const mcpSrcPath = join(CLAUDE_DIR, ".mcp.json");
  const mcpDestPath = join(GEMINI_DIR, "mcp_config.json");
  try {
    const mcpRaw = await readFile(mcpSrcPath, "utf-8");
    const mcpTransformed = transformMcp(mcpRaw);
    await writeFile(mcpDestPath, mcpTransformed, "utf-8");
    console.log("✅ mcp_config.json généré avec succès.");
  } catch (err) {
    console.error("⚠️ Impossible de générer mcp_config.json:", err);
  }

  // 2. Transpiler les agents
  const agentsSrcDir = join(CLAUDE_DIR, "agents");
  const agentsDestDir = join(GEMINI_DIR, "agents");
  await ensureDir(agentsDestDir);
  const agentFiles = await readdir(agentsSrcDir);
  for (const file of agentFiles) {
    if (extname(file) === ".md") {
      const content = await readFile(join(agentsSrcDir, file), "utf-8");
      const transformed = transformAgent(content);
      await writeFile(join(agentsDestDir, file), transformed, "utf-8");
      console.log(`✅ Agent transpilié : ${file}`);
    }
  }

  // 3. Transpiler les hooks récursivement
  const hooksSrcDir = join(CLAUDE_DIR, "hooks");
  const hooksDestDir = join(GEMINI_DIR, "hooks");
  await copyRecursive(hooksSrcDir, hooksDestDir, (content, filePath) => {
    let res = transformText(content);
    if (basename(filePath) === "caserne_session_start.test.sh") {
      res = res.replace(
        /\| Claude \| U0EXAMPLE01 \|/g,
        "| Gemini | U0EXAMPLE03 |",
      );
      res = res.replace(
        /agent courant \*: \*claude/gi,
        "agent courant : gemini",
      );
      res = res.replace(/U0EXAMPLE01/g, "U0EXAMPLE03");
    }
    return res;
  });
  console.log("✅ Hooks transpilés.");

  // 4. Transpiler les scripts
  const scriptsSrcDir = join(CLAUDE_DIR, "scripts");
  const scriptsDestDir = join(GEMINI_DIR, "scripts");
  await copyRecursive(scriptsSrcDir, scriptsDestDir, (content, filePath) => {
    if (basename(filePath) === "erom_agence.sh") {
      return '#!/usr/bin/env bash\nexport EROM_AGENCE_AGENT="gemini"\nprintf \'%s\\n\' "$EROM_AGENCE_AGENT"\n';
    }
    return transformText(content);
  });
  console.log("✅ Scripts utilitaires transpilés.");

  // 5. Transpiler les skills récursivement
  const skillsSrcDir = join(CLAUDE_DIR, "skills");
  const skillsDestDir = join(GEMINI_DIR, "skills");
  await copyRecursive(skillsSrcDir, skillsDestDir, (content, filePath) => {
    let res = transformText(content);
    if (basename(filePath) === "SKILL.md") {
      const agentMatch = content.match(/^agent:\s*([^\s\n]+)/m);
      const agentName = agentMatch ? agentMatch[1].trim() : null;

      res = res.replace(/^user-invocable:.*$\n?/m, "");
      res = res.replace(/^context:.*$\n?/m, "");
      res = res.replace(/^agent:.*$\n?/m, "");
      res = res.replace(/^memory:.*$\n?/m, "");
      res = res.replace(/^disable-model-invocation:.*$\n?/m, "");

      // Nettoyer les chevrons dans la description pour la validation d'Antigravity
      res = res.replace(/^description:\s*(.*)$/m, (match, desc) => {
        return `description: ${desc.replace(/</g, "").replace(/>/g, "")}`;
      });

      if (agentName) {
        const fmEndIdx = res.indexOf("---", 3);
        if (fmEndIdx !== -1) {
          const delegationNotice = `\n\n> [!IMPORTANT]\n> **Optimisation des ressources (modèle léger)** : Si tu es l'agent principal, tu DOIS déléguer l'intégralité de l'exécution de cette skill au sous-agent **@${agentName}** via l'outil \`start_subagent\`. Ne l'exécute pas toi-même.`;
          res =
            res.substring(0, fmEndIdx + 3) +
            delegationNotice +
            res.substring(fmEndIdx + 3);
        }
      }
    }
    if (
      filePath.includes("erom-session-checkpoint") &&
      basename(filePath) === "SKILL.md"
    ) {
      // Bloc de script de résolution de session
      const targetScript =
        'DIR="$HOME/.claude/projects/$(pwd | sed \'s#[/.]#-#g\')"\nTRANSCRIPT="${CLAUDE_CODE_SESSION_ID:+$DIR/$CLAUDE_CODE_SESSION_ID.jsonl}"\n[ -f "$TRANSCRIPT" ] || TRANSCRIPT="$(ls -t "$DIR"/*.jsonl 2>/dev/null | head -1)"';

      const geminiScript =
        'CONV_ID="$(echo "${ANTIGRAVITY_SOURCE_METADATA:-}" | grep -o \'"conversationId":"[^\"]*\' | cut -d\'"\' -f4)"\n[ -n "$CONV_ID" ] || CONV_ID="${ANTIGRAVITY_TRAJECTORY_ID:-}"\n\nDIR=""\nif [ -n "$CONV_ID" ]; then\n  for p in "$HOME/.gemini/antigravity-ide" "$HOME/.gemini/antigravity" "$HOME/.gemini/antigravity-cli"; do\n    if [ -d "$p/brain/$CONV_ID" ]; then\n      DIR="$p/brain/$CONV_ID/.system_generated/logs"\n      break\n    fi\n  done\nfi\n\nif [ -z "$DIR" ] || [ ! -d "$DIR" ]; then\n  # Fallback : recherche du transcript le plus récent parmi les 3 environnements\n  DIR="$(find "$HOME/.gemini/antigravity-ide/brain" "$HOME/.gemini/antigravity/brain" "$HOME/.gemini/antigravity-cli/brain" -name "transcript.jsonl" -type f 2>/dev/null | xargs ls -t 2>/dev/null | head -n 1 | xargs dirname 2>/dev/null || true)"\nfi\n\nTRANSCRIPT="${DIR:+$DIR/transcript.jsonl}"';

      res = res.replace(targetScript, geminiScript);

      // Ligne d'explication textuelle qui suit
      const targetExpl =
        "Cible **déterministe** le transcript de cette session via `$CLAUDE_CODE_SESSION_ID` (exposé par Claude Code), avec repli sur le `.jsonl` le plus récent (`mtime`). À résoudre **dans le contexte principal** : lui seul porte le bon session id (le scribe est un subagent).";
      const geminiExpl =
        "Cible **déterministe** le transcript de cette session via l'ID de conversation (exposé par les métadonnées d'Antigravity) en cherchant son dossier brain correspondant, avec repli sur le `transcript.jsonl` le plus récent de l'ensemble des environnements Gemini. À résoudre **dans le contexte principal** : lui seul porte le bon session id (le scribe est un subagent).";
      res = res.replace(targetExpl, geminiExpl);

      // Dispatch du scribe pour start_subagent
      const targetDispatch =
        "Appelle le subagent `erom-scribe` (tool Agent, `subagent_type: erom-scribe`).";
      const geminiDispatch =
        "Appelle le subagent `erom-scribe` (outil `start_subagent`).";
      res = res.replace(targetDispatch, geminiDispatch);
    } else if (
      filePath.includes("erom-session-checkpoint") &&
      basename(filePath) === "condense-transcript.ts"
    ) {
      // 1. Remplacer les constantes en haut
      let contentTrans = content;
      contentTrans = contentTrans.replace(
        "const RESULT_TAIL = 2;",
        "const RESULT_TAIL = 1;",
      );

      // 2. Supprimer la définition de Block (dead code)
      const targetBlockType = `type Block = {
  type: string;
  text?: string;
  thinking?: string;
  name?: string;
  input?: unknown;
  content?: unknown;
};`;
      contentTrans = contentTrans.replace(targetBlockType, "");

      // 3. Remplacer condenseResult par notre version filtrante de grounding-api-redirect
      const targetCondenseResult = `function condenseResult(content: unknown): string {
  const s = resultToString(content);
  if (s.length <= INLINE_THRESHOLD) return s;
  const lines = s.split("\\n");
  if (lines.length > RESULT_HEAD + RESULT_TAIL) {
    const head = lines.slice(0, RESULT_HEAD).join("\\n");
    const tail = lines.slice(-RESULT_TAIL).join("\\n");
    return \`\${head}\\n[result: \${lines.length} lignes, \${s.length} c - tronqué]\\n\${tail}\`;
  }
  // Peu de lignes mais longues → tronquer par caractères.
  return \`\${truncate(s, INLINE_THRESHOLD)}\\n[result: \${s.length} c - tronqué]\`;
}`;

      const geminiCondenseResult = `function condenseResult(content: unknown): string {
  const s = resultToString(content);
  let lines = s.split("\\n");
  lines = lines.filter(line => {
    const l = line.trim();
    if (l.includes("grounding-api-redirect")) return false;
    if (/^\\[\\d+\\]\\s+\\[.*\\]\\(https?:\\/\\//.test(l)) return false;
    return true;
  });
  const filtered = lines.join("\\n");
  if (filtered.length <= INLINE_THRESHOLD) return filtered;

  if (lines.length > RESULT_HEAD + RESULT_TAIL) {
    const head = lines.slice(0, RESULT_HEAD).join("\\n");
    const tail = lines.slice(-RESULT_TAIL).join("\\n");
    return \`\${head}\\n[result: \${lines.length} lignes, \${filtered.length} c - tronqué]\\n\${tail}\`;
  }
  return \`\${truncate(filtered, INLINE_THRESHOLD)}\\n[result: \${filtered.length} c - tronqué]\`;
}`;
      contentTrans = contentTrans.replace(
        targetCondenseResult,
        geminiCondenseResult,
      );

      // 4. Injecter formatToolArgs et la nouvelle fonction condense
      const oldCode = `function renderBlock(block: Block): string | null {
  switch (block.type) {
    case "text":
      return typeof block.text === "string" ? block.text : null;
    case "thinking":
      return typeof block.thinking === "string" ? \`> [thinking] \${block.thinking}\` : null;
    case "tool_use":
      return \`[tool: \${block.name ?? "?"}(\${truncate(JSON.stringify(block.input ?? {}), TOOL_INPUT_MAX)})]\`;
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
      .join("\\n\\n");
  }
  return "";
}

export function condense(jsonl: string): string {
  const out: string[] = [];
  for (const line of jsonl.split("\\n")) {
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
    out.push(\`## \${role}\\n\\n\${body}\`);
  }
  return out.join("\\n\\n");
}`;

      const newCode = `function formatToolArgs(args: unknown): string {
  if (args == null || typeof args !== "object") return "";
  const parts: string[] = [];
  const entries = Object.entries(args as Record<string, unknown>);

  for (const [key, val] of entries) {
    if (key === "toolAction" || key === "toolSummary") continue;

    let formattedVal = "";
    if (key === "CodeContent" || key === "ArtifactMetadata") {
      const len = typeof val === "string" ? val.length : JSON.stringify(val ?? "").length;
      formattedVal = \`<\${len} c>\`;
    } else {
      let stringVal = typeof val === "string" ? val : JSON.stringify(val ?? "");
      if (stringVal.startsWith('"') && stringVal.endsWith('"') && stringVal.length >= 2) {
        stringVal = stringVal.slice(1, -1);
      }
      formattedVal = truncate(stringVal, 100);
    }
    parts.push(\`\${key}=\${formattedVal}\`);
  }
  return parts.join(", ");
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

    if (obj.type === "USER_INPUT" && obj.content && typeof obj.content === "string") {
      const cleanContent = obj.content
        .replace(/<USER_REQUEST>[\\s\\S]*?<\\/USER_REQUEST>/g, (m: string) => m.replace(/<\\/?USER_REQUEST>/g, ""))
        .replace(/<ADDITIONAL_METADATA>[\\s\\S]*?<\\/ADDITIONAL_METADATA>/g, "")
        .replace(/<USER_SETTINGS_CHANGE>[\\s\\S]*?<\\/USER_SETTINGS_CHANGE>/g, "")
        .trim();

      if (cleanContent) {
        out.push(\`## USER\\n\\n\${cleanContent}\`);
      }
    }
    else if (obj.type === "PLANNER_RESPONSE") {
      let body = "";
      if (obj.thinking && typeof obj.thinking === "string") {
        body += \`> [thinking] \${obj.thinking.trim()}\\n\\n\`;
      }
      if (obj.content && typeof obj.content === "string") {
        body += obj.content.trim();
      }
      if (obj.tool_calls && Array.isArray(obj.tool_calls) && obj.tool_calls.length > 0) {
        const tools = obj.tool_calls
          .map((tc: any) => \`[tool: \${tc.name ?? "?"}(\${formatToolArgs(tc.args)})]\`)
          .filter((t: string) => t !== "")
          .join("\\n");
        if (tools) {
          body += (body ? "\\n\\n" : "") + tools;
        }
      }

      if (body.trim()) {
        out.push(\`## ASSISTANT\\n\\n\${body.trim()}\`);
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
  return out.join("\\n\\n");
}`;

      contentTrans = contentTrans.replace(oldCode, newCode);
      contentTrans = contentTrans.replace(
        '// Condense un transcript Claude Code (.jsonl) en markdown "dialogue pur".',
        '// Condense un transcript Gemini / Antigravity (.jsonl) en markdown "dialogue pur".',
      );
      res = contentTrans;
    } else if (
      filePath.includes("erom-session-checkpoint") &&
      basename(filePath) === "condense-transcript.test.ts"
    ) {
      // Remplacement complet du fichier de test pour s'adapter au format JSONL Gemini et à nos nouvelles règles
      res = `import { test, expect } from "bun:test";
import { condense } from "./condense-transcript";

test("ignore les types de lignes non concernées", () => {
  const jsonl = [
    JSON.stringify({ type: "SYSTEM", status: "DONE" }),
    JSON.stringify({ type: "USER_INPUT", content: "salut" }),
  ].join("\\n");
  const out = condense(jsonl);
  expect(out).toContain("salut");
  expect(out).not.toContain("SYSTEM");
});

test("garde text + thinking, réduit tool_use à un marqueur et filtre toolAction/toolSummary", () => {
  const jsonl = JSON.stringify({
    type: "PLANNER_RESPONSE",
    thinking: "je pèse X vs Y",
    content: "voici la réponse",
    tool_calls: [{ name: "run_command", args: { CommandLine: "\\"ls -la\\"", toolAction: "Action", toolSummary: "Summary" } }]
  });
  const out = condense(jsonl);
  expect(out).toContain("je pèse X vs Y");
  expect(out).toContain("voici la réponse");
  expect(out).toContain("[tool: run_command(CommandLine=ls -la)]");
  expect(out).not.toContain("toolAction");
  expect(out).not.toContain("toolSummary");
});

test("masque CodeContent et ArtifactMetadata par leur taille", () => {
  const jsonl = JSON.stringify({
    type: "PLANNER_RESPONSE",
    content: "code",
    tool_calls: [{ name: "write_to_file", args: { TargetFile: "\\"path.ts\\"", CodeContent: "const a = 1;" } }]
  });
  const out = condense(jsonl);
  expect(out).toContain("[tool: write_to_file(TargetFile=path.ts, CodeContent=<12 c>)]");
});

test("tronque les gros tool_result et supprime les urls de grounding", () => {
  const jsonl = [
    JSON.stringify({ source: "MODEL", type: "search_web", status: "DONE", content: "ligne 1\\nligne 2\\nligne 3\\nligne 4\\nligne 5\\nligne 6\\nligne 7\\nligne 8\\nligne 9\\n[1] [antigravity.google](https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc)\\nligne 11\\n" + "x".repeat(600) }),
  ].join("\\n");
  const out = condense(jsonl);
  expect(out).not.toContain("grounding-api-redirect");
  expect(out).toContain("ligne 1");
  expect(out).toContain("[result:");
});

test("préfixe ## USER / ## ASSISTANT et ignore le JSON malformé", () => {
  const jsonl = ["{pas du json", JSON.stringify({ type: "USER_INPUT", content: "hello" })].join("\\n");
  const out = condense(jsonl);
  expect(out).toMatch(/## USER/);
  expect(out).toContain("hello");
});
`;
  console.log("✅ Skills transpilés.");

  console.log("🎉 Génération complétée avec succès !");
}

main().catch((err) => {
  console.error("🚨 Erreur critique de génération :", err);
  process.exit(1);
});
