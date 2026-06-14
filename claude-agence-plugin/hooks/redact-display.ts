#!/usr/bin/env bun
// Hook MessageDisplay : rédige (à l'écran seulement) les secrets dans le texte
// que l'agent écrit. Sert surtout au mode partage d'écran, mais le tier
// `mandatory` est appliqué en permanence (masque un credential que l'agent
// répèterait dans sa réponse). Sert aussi de CLI pour basculer le mode partage.
import { redact } from "./redact-rules.ts";
import { currentTiers, isShareOn, setShare } from "./redact-state.ts";

// --- CLI : bascule du masquage PII (mode partage d'écran). Pilotée par /pii-activate.
// Accepte on|off|status, avec ou sans "--".
const arg = (process.argv[2] ?? "").replace(/^--/, "");
if (arg === "on" || arg === "off") {
  setShare(arg === "on");
  console.log(`masquage PII (IP, emails, chemins perso) : ${arg === "on" ? "ON ✅" : "OFF"}`);
  process.exit(0);
}
if (arg === "status") {
  console.log(`masquage PII : ${isShareOn() ? "ON ✅" : "OFF"}`);
  process.exit(0);
}

// --- mode hook : MessageDisplay fournit le texte affiché dans `delta` ---
const raw = await Bun.stdin.text();
let input: { delta?: unknown };
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}
if (typeof input.delta !== "string") process.exit(0);

const { text, count } = redact(input.delta, currentTiers());
if (count === 0) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "MessageDisplay",
      displayContent: text,
    },
  }),
);
