// Script autonome Bun pour agréger les résultats de recherche de Gerber.

import { homedir } from "os";

const PROJECT_PATH = process.env.CASERNE_VAULT_PATH;
const HOME = homedir();

// Typage des résultats Cortex
interface CortexResultItem {
  rank: number;
  path: string;
  title: string;
  type: string;
  snippet: string;
}

interface CortexResponse {
  mode: string;
  count: number;
  results: CortexResultItem[];
}

// Typage des mémoires
interface MemoryItem {
  date: string;
  file: string;
  fragment: string;
  project: string;
  topic: string;
}

// Typage des sessions
interface SessionMatch {
  index: string;
  role: string;
  project: string;
  date: string;
  snippet: string;
  session: string;
  resume: string;
}

// 1. Interroger Cortex Vault via le serveur MCP en Stdio
async function queryCortexVault(
  query: string,
  limit = 5,
): Promise<CortexResponse | null> {
  try {
    const mcpServerPath = process.env.CASERNE_VAULT_MCP_SERVER;

    const proc = Bun.spawn(["bun", "run", mcpServerPath], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "ignore",
    });

    const requestJson =
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "query_cortex_vault",
          arguments: {
            query,
            limit,
          },
        },
      }) + "\n";

    proc.stdin.write(requestJson);
    proc.stdin.flush();
    proc.stdin.end();

    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let responseText: string | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.jsonrpc === "2.0" && parsed.id === 1) {
            if (parsed.error) {
              console.error(
                "🚨 Erreur renvoyée par le serveur MCP:",
                parsed.error,
              );
            } else {
              responseText = parsed.result?.content?.[0]?.text || null;
            }
            break;
          }
        } catch {
          // Ignorer les lignes non-JSON ou invalides
        }
      }

      if (responseText !== null) {
        break;
      }
    }

    proc.kill();
    await proc.exited;

    if (responseText !== null) {
      return JSON.parse(responseText) as CortexResponse;
    }

    return null;
  } catch (err) {
    console.error(
      "⚠️ Erreur lors de l'appel au serveur MCP Cortex Vault:",
      err,
    );
    return null;
  }
}

// 2. Interroger search-memories (CLI Rust)
async function querySearchMemories(query: string): Promise<MemoryItem[]> {
  try {
    const proc = Bun.spawn(["search-memories", query], {
      stdout: "pipe",
      stderr: "ignore",
    });
    const output = await new Response(proc.stdout).text();
    const trimmed = output.trim();
    if (!trimmed || trimmed === "No matches found in memory sessions.") {
      return [];
    }

    return trimmed
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line) as MemoryItem;
        } catch {
          return null;
        }
      })
      .filter((x): x is MemoryItem => x !== null);
  } catch (err) {
    console.error("⚠️ Impossible d'exécuter search-memories:", err);
    return [];
  }
}

// 3. Interroger search-sessions (CLI Rust)
async function querySearchSessions(query: string): Promise<SessionMatch[]> {
  try {
    const proc = Bun.spawn(["search-sessions", "--limit", 5, "--deep", query], {
      stdout: "pipe",
      stderr: "ignore",
    });
    const output = await new Response(proc.stdout).text();

    return parseSessions(output);
  } catch (err) {
    console.error("⚠️ Impossible d'exécuter search-sessions:", err);
    return [];
  }
}

// Parser la sortie brute textuelle de search-sessions
function parseSessions(text: string): SessionMatch[] {
  const sessions: SessionMatch[] = [];
  const blocks = text.split(/\n\s*\[(\d+)\]\s+/);
  if (blocks.length <= 1) return [];

  for (let i = 1; i < blocks.length; i += 2) {
    const index = blocks[i];
    const body = blocks[i + 1] || "";

    const roleMatch = body.match(/^\[(USER|ASST)\]/);
    const projectMatch = body.match(/Project:\s+(.+)/);
    const dateMatch = body.match(/Date:\s+(.+)/);
    const snippetMatch = body.match(
      /Snippet:\s+([\s\S]*?)(?=\n\s*(?:Session:|Resume:|$))/,
    );
    const sessionMatch = body.match(/Session:\s+(.+)/);
    const resumeMatch = body.match(/Resume:\s+(.+)/);

    if (projectMatch && dateMatch && sessionMatch) {
      sessions.push({
        index,
        role: roleMatch ? roleMatch[1] : "USER",
        project: projectMatch[1].trim(),
        date: dateMatch[1].trim(),
        snippet: snippetMatch ? snippetMatch[1].trim() : "",
        session: sessionMatch[1].trim(),
        resume: resumeMatch ? resumeMatch[1].trim() : "",
      });
    }
  }
  return sessions;
}

// Formater le chemin absolu en lien Markdown cliquable local
function formatLocalLink(absolutePath: string, label?: string): string {
  const cleanPath = absolutePath.replace(HOME, "~");
  const displayLabel = label || cleanPath;
  return `[${displayLabel}](file://${absolutePath})`;
}

// Formater le fragment de code pour un rendu propre
function formatCodeSnippet(snippet: string): string {
  if (!snippet) return "";
  // Nettoyer les \n ou \t échappés s'ils proviennent d'un parsing JSON ou texte
  const cleaned = snippet
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"');
  return cleaned;
}

// Formater une chaîne de caractères en YAML (sécurisé)
function escapeYamlString(str: string): string {
  if (!str) return '""';
  // Si la chaîne contient des caractères spéciaux ou de nouvelles lignes, on utilise le format standard
  if (/[#':\-\[\]\{\},|>&*?%@`]/.test(str) || str.includes("\n")) {
    return JSON.stringify(str);
  }
  return `"${str}"`;
}

// Formater les snippets de code en blocs multiline YAML (| ou >)
function formatYamlSnippet(snippet: string, indent: string): string {
  if (!snippet) return '""';
  const cleaned = formatCodeSnippet(snippet).trim();

  if (cleaned.includes("\n")) {
    const lines = cleaned.split("\n").map((line) => `${indent}  ${line}`);
    return `|\n${lines.join("\n")}`;
  }

  if (/[#':\-\[\]\{\},|>&*?%@`]/.test(cleaned) || cleaned.length > 80) {
    return `>\n${indent}  ${cleaned}`;
  }

  return escapeYamlString(cleaned);
}

// Générer le rendu final en YAML premium
function generateYaml(
  query: string,
  cortex: CortexResponse | null,
  memories: MemoryItem[],
  sessions: SessionMatch[],
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const currentDate = `${year}/${month}/${day}`;

  let globalId = 1;

  let yaml = `query: ${escapeYamlString(query)}\n`;
  yaml += `date: ${escapeYamlString(currentDate)}\n\n`;

  // --- Cortex ---
  yaml += `cortex:\n`;
  yaml += `  description: "Concepts théoriques et structures de tes satellites."\n`;
  yaml += `  results:\n`;
  if (cortex && cortex.results.length > 0) {
    cortex.results.forEach((item) => {
      const displayPath = `${PROJECT_PATH}/wiki/${item.path}`.replace(
        HOME,
        "~",
      );
      yaml += `    - id: "#${globalId++}"\n`;
      yaml += `      title: ${escapeYamlString(item.title)}\n`;
      yaml += `      path: ${escapeYamlString(displayPath)}\n`;
      yaml += `      snippet: ${formatYamlSnippet(item.snippet, "      ")}\n\n`;
    });
  } else {
    yaml += `    []\n\n`;
  }

  // --- Memories ---
  yaml += `memories:\n`;
  yaml += `  description: "Décisions consolidées et synthèses d'étapes gravées dans le marbre par Gemini."\n`;
  yaml += `  results: "Codex n'a pas accès pour le moment"\n\n`;
  // --- Sessions ---
  yaml += `sessions:\n`;
  yaml += `  description: "Fils de discussions complets et snippets extraits du chat historique."\n`;
  yaml += `  results: "Codex n'a pas accès pour le moment"\n\n`;



  return yaml.trim();
}

// Point d'entrée principal
async function main() {
  const args = process.argv.slice(2);
  const query = args.join(" ").trim();

  if (!query) {
    console.log('Usage: bun run search.ts "<query>"');
    process.exit(1);
  }

  // Lancement des 3 recherches en parallèle
  const [cortexRes, memoriesRes, sessionsRes] = await Promise.all([
    queryCortexVault(query),
    querySearchMemories(query),
    querySearchSessions(query),
  ]);

  const outputYaml = generateYaml(query, cortexRes, memoriesRes, sessionsRes);
  console.log(outputYaml);
}

main().catch((err) => {
  console.error("🚨 Erreur critique d'exécution:", err);
  process.exit(1);
});
