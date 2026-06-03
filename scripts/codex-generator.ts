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
  const sandboxMode = /(^|,\s*)(Write|Edit|NotebookEdit)(\s*,|$)/.test(
    disallowedTools,
  )
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
