import { expect, test, beforeEach } from "bun:test";

// État isolé pour ce fichier (évite la race avec les autres suites).
process.env.REDACT_SHARE_FILE = "/tmp/caserne-redact-share-disp.test";
const { setShare, isShareOn } = await import("./redact-state.ts");

const SCRIPT = new URL("./redact-display.ts", import.meta.url).pathname;

beforeEach(() => setShare(false));

async function run(args: string[], stdin?: object): Promise<string> {
  const proc = Bun.spawn(["bun", SCRIPT, ...args], {
    stdin: stdin ? new Blob([JSON.stringify(stdin)]) : "ignore",
    stdout: "pipe",
    env: process.env,
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return out;
}

test("CLI --on / --off bascule l'état partagé", async () => {
  await run(["--on"]);
  expect(isShareOn()).toBe(true);
  await run(["--off"]);
  expect(isShareOn()).toBe(false);
});

test("hook normal : credential dans le texte agent rédigé (mandatory, écran)", async () => {
  const key = "ghp_" + "A".repeat(36);
  const out = await run([], { delta: `je vois ${key} ici` });
  const json = JSON.parse(out);
  expect(json.hookSpecificOutput.hookEventName).toBe("MessageDisplay");
  expect(json.hookSpecificOutput.displayContent).toBe("je vois [REDACTED:github_pat] ici");
});

test("hook normal : IP NON rédigée (tier display inactif)", async () => {
  const out = await run([], { delta: "serveur 192.168.1.1" });
  expect(out.trim()).toBe("");
});

test("hook partage ON : IP + email rédigés à l'écran", async () => {
  setShare(true);
  const out = await run([], { delta: "ip 10.0.0.1 mail a@b.com" });
  const c = JSON.parse(out).hookSpecificOutput.displayContent;
  expect(c).toContain("[REDACTED:ipv4]");
  expect(c).toContain("[REDACTED:email]");
});

test("aucun secret : sortie vide", async () => {
  const out = await run([], { delta: "bonjour le monde" });
  expect(out.trim()).toBe("");
});
