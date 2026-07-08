import { expect, test } from "bun:test";

const SCRIPT = new URL("./redact-prompt-guard.ts", import.meta.url).pathname;

// Spawn du hook comme le ferait Claude Code : JSON sur stdin, JSON (ou vide) sur stdout.
async function run(userPrompt: string): Promise<string> {
  const proc = Bun.spawn(["bun", SCRIPT], {
    stdin: new Blob([JSON.stringify({ hook_event_name: "UserPromptSubmit", user_prompt: userPrompt })]),
    stdout: "pipe",
    env: process.env,
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return out;
}

test("prompt avec token Slack : bloqué, valeur jamais réémise", async () => {
  const key = "xox" + "b-1234567890-1234567890-" + "A".repeat(24);
  const out = await run(`débogue avec ${key} stp`);
  const json = JSON.parse(out);
  expect(json.decision).toBe("block");
  expect(json.systemMessage).toContain("slack_token");
  expect(out).not.toContain(key); // ni reason ni systemMessage ne contiennent la valeur
});

test("prompt avec mot de passe labellisé : bloqué", async () => {
  const out = await run("le passe: motdepasse123 pour l'admin Stalwart");
  const json = JSON.parse(out);
  expect(json.decision).toBe("block");
  expect(json.systemMessage).toContain("labeled_secret");
});

test("prompt avec clé API Linear : bloqué", async () => {
  const key = "lin" + "_api_" + "a".repeat(40);
  expect(JSON.parse(await run(`clé ${key}`)).decision).toBe("block");
});

test("prompt propre : sortie vide (laissé passer)", async () => {
  expect((await run("explique-moi comment gérer les tokens OAuth")).trim()).toBe("");
});

test("prompt avec IP ou email seuls : NON bloqué (tier display exclu)", async () => {
  expect((await run("le serveur 192.168.1.1 répond à contact@example.com")).trim()).toBe("");
});

test("stdin non-JSON : sortie vide, pas de crash", async () => {
  const proc = Bun.spawn(["bun", SCRIPT], { stdin: new Blob(["pas du json"]), stdout: "pipe", env: process.env });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  expect(out.trim()).toBe("");
});
