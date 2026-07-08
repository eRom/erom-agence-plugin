#!/usr/bin/env bun
// Hook UserPromptSubmit : bloque un prompt qui contient un secret en clair.
// L'API Claude Code ne permet PAS de réécrire un prompt, seulement de le bloquer.
// Le blocage EST le garde-fou : l'utilisateur recolle une version masquée.
//
// Vecteur ciblé : la rétro 2026-07 a montré 4 secrets collés en clair dans des prompts
// (client_secret + access_token Linear, refresh token Slack, mot de passe admin Stalwart).
// Aucun autre hook ne voit un prompt : redact-context (PostToolUse) ne lit que les SORTIES
// d'outils. Ce hook est le seul à couvrir le collage direct.
import { matchedRules } from "./redact-rules.ts";

const raw = await Bun.stdin.text();

let input: { user_prompt?: string };
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const prompt = input.user_prompt;
if (typeof prompt !== "string" || prompt === "") process.exit(0);

// Tiers "mandatory" (patterns de credentials) + "prompt" (labels FR/EN).
// JAMAIS "display" : bloquer un prompt sur une IP ou un email serait absurde.
const hits = matchedRules(prompt, ["mandatory", "prompt"]);
if (hits.length === 0) process.exit(0);

// IMPORTANT : ne JAMAIS réémettre la valeur détectée. `reason` repart vers Claude,
// `systemMessage` s'affiche à l'utilisateur — on ne cite que les TYPES de règles.
const types = [...new Set(hits)].join(", ");
process.stdout.write(
  JSON.stringify({
    decision: "block",
    reason: `Prompt bloqué : secret(s) en clair détecté(s) (${types}). Recolle en masquant la valeur.`,
    systemMessage: `🔒 Secret détecté dans ton prompt (${types}) — soumission bloquée. Recolle sans la valeur brute (préfixe + longueur, ou une variable d'env).`,
  }),
);
process.exit(0);
