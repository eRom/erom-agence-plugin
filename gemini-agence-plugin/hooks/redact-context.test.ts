import { expect, test, beforeEach } from "bun:test";

// État isolé pour ce fichier (évite la race avec les autres suites).
process.env.REDACT_SHARE_FILE = "/tmp/caserne-redact-share-ctx.test";
const { setShare } = await import("./redact-state.ts");

const SCRIPT = new URL("./redact-context.ts", import.meta.url).pathname;

// Mode normal (partage off) par défaut avant chaque test.
beforeEach(() => setShare(false));

async function run(input: object): Promise<string> {
  const proc = Bun.spawn(["bun", SCRIPT], { stdin: new Blob([JSON.stringify(input)]), stdout: "pipe", env: process.env });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return out;
}

// Schéma réel (vérifié sur transcript) : tool_response de Bash est un OBJET
// { stdout: string, stderr: string, interrupted, isImage, noOutputExpected }.
// Le hook rédige récursivement toutes les valeurs string et ressort le même objet.
test("Bash (tool_response objet) : rédige le secret dans stdout", async () => {
  const key = "ghp_" + "A".repeat(36);
  const out = await run({
    tool_name: "Bash",
    tool_response: { stdout: `remote: ${key}`, stderr: "", interrupted: false, isImage: false },
  });
  const json = JSON.parse(out);
  expect(json.hookSpecificOutput.hookEventName).toBe("PostToolUse");
  expect(json.hookSpecificOutput.updatedToolOutput.stdout).toBe("remote: [REDACTED:github_pat]");
  expect(JSON.stringify(json)).not.toContain(key);
});

test("Bash : secret dans stderr aussi rédigé", async () => {
  const key = "ghp_" + "B".repeat(36);
  const out = await run({
    tool_name: "Bash",
    tool_response: { stdout: "", stderr: `fatal: ${key}`, interrupted: false, isImage: false },
  });
  expect(JSON.parse(out).hookSpecificOutput.updatedToolOutput.stderr).toBe("fatal: [REDACTED:github_pat]");
});

test("Read (objet imbriqué) : rédige récursivement", async () => {
  const key = "sk-ant-api03-" + "a".repeat(95);
  const out = await run({
    tool_name: "Read",
    tool_response: { type: "text", file: { filePath: "/x/.env", content: `ANTHROPIC_API_KEY=${key}`, numLines: 1 } },
  });
  const json = JSON.parse(out);
  expect(json.hookSpecificOutput.updatedToolOutput.file.content).toContain("[REDACTED:");
  expect(JSON.stringify(json)).not.toContain(key);
});

test("tool_response string (compat) : rédige aussi", async () => {
  const key = "ghp_" + "C".repeat(36);
  const out = await run({ tool_name: "Bash", tool_response: `x ${key}` });
  expect(JSON.parse(out).hookSpecificOutput.updatedToolOutput).toBe("x [REDACTED:github_pat]");
});

test("aucun secret : sortie vide (pas de réécriture)", async () => {
  const out = await run({ tool_name: "Bash", tool_response: { stdout: "build ok", stderr: "" } });
  expect(out.trim()).toBe("");
});

test("outil hors cible (Write) : ignoré", async () => {
  const out = await run({ tool_name: "Write", tool_response: { stdout: "ghp_" + "A".repeat(36) } });
  expect(out.trim()).toBe("");
});

test("IPv4 NON masquée (tier mandatory seul)", async () => {
  const out = await run({ tool_name: "Bash", tool_response: { stdout: "ping 192.168.1.1", stderr: "" } });
  expect(out.trim()).toBe("");
});

test("mode partage ON : IP + email aussi masqués (tier display ajouté)", async () => {
  setShare(true);
  const out = await run({ tool_name: "Bash", tool_response: { stdout: "ip 10.0.0.1 mail a@b.com", stderr: "" } });
  const o = JSON.parse(out).hookSpecificOutput.updatedToolOutput;
  expect(o.stdout).toContain("[REDACTED:ipv4]");
  expect(o.stdout).toContain("[REDACTED:email]");
});
