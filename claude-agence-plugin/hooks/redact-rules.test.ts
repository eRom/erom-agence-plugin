import { expect, test } from "bun:test";
import { redact } from "./redact-rules.ts";

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
