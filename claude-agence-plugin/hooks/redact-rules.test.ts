import { expect, test } from "bun:test";
import { redact, matchedRules } from "./redact-rules.ts";

test("rédige une clé Anthropic", () => {
  const key = "sk-ant-api03-" + "a".repeat(95);
  const { text, count } = redact(`token=${key}`, ["mandatory"]);
  expect(text).toContain("[REDACTED:anthropic_key]");
  expect(text).not.toContain(key);
  expect(count).toBe(1);
});

test("rédige un GitHub PAT classic", () => {
  const key = "ghp_" + "A".repeat(36);
  expect(redact(key, ["mandatory"]).text).toBe("[REDACTED:github_pat]");
});

test("rédige un GitHub fine-grained PAT", () => {
  const key = "github_pat_" + "B".repeat(82);
  expect(redact(key, ["mandatory"]).text).toBe("[REDACTED:github_pat_fine]");
});

test("rédige un token Slack xox* (bot/user)", () => {
  // construit dynamiquement : évite que le scanner de secrets (GitHub push
  // protection) ne voie un littéral `xoxb-…` complet dans le source
  const key = "xox" + "b-1234567890-1234567890-" + "A".repeat(24);
  expect(redact(key, ["mandatory"]).text).toBe("[REDACTED:slack_token]");
});

test("ne masque PAS une déclaration de code à nom minuscule (key/token)", () => {
  expect(redact('const key = "documentation";', ["mandatory"]).count).toBe(0);
  expect(redact('let token = "placeholder_value";', ["mandatory"]).count).toBe(0);
});

test("rédige un AWS Access ID", () => {
  expect(redact("AKIAIOSFODNN7EXAMPLE", ["mandatory"]).text).toBe("[REDACTED:aws_key]");
});

test("rédige une Stripe key", () => {
  const key = "sk_live_" + "a".repeat(24);
  expect(redact(key, ["mandatory"]).text).toBe("[REDACTED:stripe_key]");
});

test("rédige un JWT", () => {
  const jwt = "eyJhbGciOiJIUzI1.eyJzdWIiOiIxMjM0NTY.SflKxwRJSMeKKF2QT4";
  expect(redact(jwt, ["mandatory"]).text).toBe("[REDACTED:jwt]");
});

test("rédige une clé OpenAI sans la confondre avec generic sk-", () => {
  const key = "sk-" + "a".repeat(48);
  expect(redact(key, ["mandatory"]).text).toBe("[REDACTED:openai_key]");
});

test("rédige une assignation TOKEN=valeur en gardant le nom", () => {
  const { text } = redact("API_TOKEN=abcdef0123456789", ["mandatory"]);
  expect(text).toBe("API_TOKEN=[REDACTED:env_secret]");
});

test("rédige plusieurs secrets sur une ligne", () => {
  const a = "ghp_" + "A".repeat(36);
  const b = "gho_" + "C".repeat(36);
  const { count } = redact(`${a} et ${b}`, ["mandatory"]);
  expect(count).toBe(2);
});

test("ne masque PAS du texte normal contenant 'key'/'token'", () => {
  const s = "The api key is documented in the readme, see token handling.";
  expect(redact(s, ["mandatory"]).count).toBe(0);
});

test("ne masque PAS une assignation triviale", () => {
  expect(redact("DEBUG_KEY=1", ["mandatory"]).count).toBe(0);
  expect(redact("USE_TOKEN=true", ["mandatory"]).count).toBe(0);
});

test("ne masque PAS un hash git ni un UUID", () => {
  expect(redact("a849b22f1c3d4e5", ["mandatory"]).count).toBe(0);
  expect(redact("550e8400-e29b-41d4-a716-446655440000", ["mandatory"]).count).toBe(0);
});

test("est idempotent : un texte déjà rédigé ne rechange pas", () => {
  const once = redact("ghp_" + "A".repeat(36), ["mandatory"]).text;
  const twice = redact(once, ["mandatory"]).text;
  expect(twice).toBe(once);
});

test("IPv4 : masquée par le tier display, PAS par mandatory seul", () => {
  expect(redact("192.168.1.42", ["mandatory"]).count).toBe(0);
  expect(redact("192.168.1.42", ["mandatory", "display"]).text).toBe("[REDACTED:ipv4]");
});

test("IPv6 : masquée par le tier display", () => {
  const ip = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
  expect(redact(ip, ["mandatory", "display"]).text).toBe("[REDACTED:ipv6]");
});

test("email : masqué par display, PAS par mandatory seul", () => {
  expect(redact("contact: romain@example.com", ["mandatory"]).count).toBe(0);
  expect(redact("contact: romain@example.com", ["mandatory", "display"]).text).toBe("contact: [REDACTED:email]");
});

test("chemin perso : username masqué par display, PAS par mandatory seul", () => {
  expect(redact("/Users/recarnot/dev/app", ["mandatory"]).count).toBe(0);
  expect(redact("/Users/recarnot/dev/app", ["mandatory", "display"]).text).toBe("/Users/[REDACTED:user]/dev/app");
});

// --- Ajouts anti-secret (rétro 2026-07) ---

test("rédige une clé API Linear (lin_api_ + 40)", () => {
  const key = "lin" + "_api_" + "a".repeat(40);
  expect(redact(key, ["mandatory"]).text).toBe("[REDACTED:linear_api_key]");
});

test("rédige le token de config d'app Slack xoxe.xoxp- (le point ne fuit plus)", () => {
  const key = "xox" + "e.xoxp-" + "A".repeat(24);
  const { text } = redact(`slack: ${key}`, ["mandatory"]);
  expect(text).toBe("slack: [REDACTED:slack_token]");
  expect(text).not.toContain("xoxe.");
});

test("env_secret conserve les guillemets autour du placeholder", () => {
  expect(redact('KEY="abcdef0123456789"', ["mandatory"]).text).toBe('KEY="[REDACTED:env_secret]"');
  // sans guillemets : comportement inchangé
  expect(redact("API_TOKEN=abcdef0123456789", ["mandatory"]).text).toBe("API_TOKEN=[REDACTED:env_secret]");
});

test("phone : motif 3-3-4 NON masqué en mandatory (bascule display)", () => {
  expect(redact("150 300 2026", ["mandatory"]).count).toBe(0);
  expect(redact("512 512 4096", ["mandatory"]).count).toBe(0);
  expect(redact("061 234 5678", ["mandatory", "display"]).text).toBe("[REDACTED:phone]");
});

test("labeled_secret : tier prompt uniquement, jamais mandatory", () => {
  expect(redact("passe: motdepasse123", ["mandatory"]).count).toBe(0);
  expect(redact("passe: motdepasse123", ["prompt"]).text).toBe("passe: [REDACTED:labeled_secret]");
  expect(redact("client_secret=abcdef012345", ["prompt"]).text).toBe("client_secret=[REDACTED:labeled_secret]");
});

test("labeled_secret : pas de faux positif sur une valeur trop courte ou du code", () => {
  expect(redact("token: str", ["prompt"]).count).toBe(0); // 3 chars < 8
  expect(redact("access_token: process.env.FOO", ["prompt"]).count).toBe(0); // ponctuation de code
});

test("matchedRules : retourne les noms sans transformer, filtré par tier", () => {
  const slack = "xox" + "b-1234567890-1234567890-" + "A".repeat(24);
  expect(matchedRules(`voici ${slack}`, ["mandatory", "prompt"])).toContain("slack_token");
  expect(matchedRules("passe: motdepasse123", ["mandatory", "prompt"])).toContain("labeled_secret");
  expect(matchedRules("passe: motdepasse123", ["mandatory"])).toEqual([]); // labeled_secret est tier prompt
  expect(matchedRules("texte normal sans secret", ["mandatory", "prompt"])).toEqual([]);
  expect(matchedRules("serveur 192.168.1.1", ["mandatory", "prompt"])).toEqual([]); // ipv4 = display, exclu
});
