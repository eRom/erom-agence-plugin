// Règles de rédaction de secrets, portées depuis Warp (secrets.rs).
// Tier "mandatory" : toujours appliqué (secrets sensibles : clés API, tokens, etc.)
// Tier "display" : appliqué en plus pour l'affichage (données moins critiques : IP, etc.)
// Tier "prompt" : réservé au hook UserPromptSubmit (redact-prompt-guard). Heuristiques de
//   LABEL (mot de passe: …, client_secret= …) trop agressives pour les sorties d'outils —
//   elles ne servent qu'à BLOQUER un prompt, jamais à réécrire une sortie.

export type Tier = "mandatory" | "display" | "prompt";

interface Rule {
  name: string;
  tier: Tier;
  regex: RegExp; // doit être global (/g)
  replacement: string; // peut contenir des backrefs $1, $2...
}

// Règles ordonnées du plus spécifique au plus générique
// (generic_sk APRÈS anthropic_key/openai_key pour ne pas les masquer en premier).
const RULES: Rule[] = [
  { name: "anthropic_key", tier: "mandatory", regex: /\bsk-ant-api\d{0,2}-[a-zA-Z0-9\-]{80,120}\b/g, replacement: "[REDACTED:anthropic_key]" },
  { name: "openai_key", tier: "mandatory", regex: /\bsk-[a-zA-Z0-9]{48}\b/g, replacement: "[REDACTED:openai_key]" },
  { name: "generic_sk", tier: "mandatory", regex: /\bsk-[a-zA-Z0-9\-]{10,100}\b/g, replacement: "[REDACTED:generic_sk]" },
  { name: "github_pat_fine", tier: "mandatory", regex: /\bgithub_pat_[A-Za-z0-9_]{82}\b/g, replacement: "[REDACTED:github_pat_fine]" },
  { name: "github_pat", tier: "mandatory", regex: /\bghp_[A-Za-z0-9_]{36}\b/g, replacement: "[REDACTED:github_pat]" },
  { name: "github_oauth", tier: "mandatory", regex: /\bgho_[A-Za-z0-9_]{36}\b/g, replacement: "[REDACTED:github_oauth]" },
  { name: "github_user_to_server", tier: "mandatory", regex: /\bghu_[A-Za-z0-9_]{36}\b/g, replacement: "[REDACTED:github_uts]" },
  { name: "github_server_to_server", tier: "mandatory", regex: /\bghs_[A-Za-z0-9_]{36}\b/g, replacement: "[REDACTED:github_sts]" },
  { name: "aws_key", tier: "mandatory", regex: /\b(?:AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{12,}\b/g, replacement: "[REDACTED:aws_key]" },
  { name: "stripe_key", tier: "mandatory", regex: /\b(?:r|s)k_(?:test|live)_[0-9a-zA-Z]{24}\b/g, replacement: "[REDACTED:stripe_key]" },
  { name: "slack_app_token", tier: "mandatory", regex: /\bxapp-[0-9]+-[A-Za-z0-9_]+-[0-9]+-[a-f0-9]+\b/g, replacement: "[REDACTED:slack_app_token]" },
  // xox[baprse]- couvre bot/user/refresh ; (?:\.xox[a-z])? capte le token de config
  // d'app Slack "xoxe.xoxp-…" (secrets.yml : slack.app_config_token), sinon "xoxe." fuit.
  { name: "slack_token", tier: "mandatory", regex: /\bxox[baprse](?:\.xox[a-z])?-[0-9A-Za-z-]{10,}\b/g, replacement: "[REDACTED:slack_token]" },
  // Linear : SEUL le Personal API key a un préfixe fiable (gitleaks : lin_api_ + 40 alnum).
  // L'access_token OAuth (hex 64) et le client_secret n'ont PAS de préfixe (GitGuardian :
  // "Prefixed: False") → indétectables par valeur, couverts par label (tier prompt).
  { name: "linear_api_key", tier: "mandatory", regex: /\blin_api_[A-Za-z0-9]{40}\b/g, replacement: "[REDACTED:linear_api_key]" },
  { name: "google_api_key", tier: "mandatory", regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g, replacement: "[REDACTED:google_api_key]" },
  { name: "firebase_auth_domain", tier: "mandatory", regex: /\b[a-z0-9-]{1,30}\.firebaseapp\.com\b/g, replacement: "[REDACTED:firebase_domain]" },
  { name: "fireworks_key", tier: "mandatory", regex: /\bfw_[a-zA-Z0-9]{24}\b/g, replacement: "[REDACTED:fireworks_key]" },
  { name: "warp_key", tier: "mandatory", regex: /\bwk-[0-9]+\.[A-Fa-f0-9.\-]+\b/g, replacement: "[REDACTED:warp_key]" },
  { name: "jwt", tier: "mandatory", regex: /\b(?:ey[a-zA-Z0-9_\-=]{10,}\.){2}[a-zA-Z0-9_\-=]{10,}\b/g, replacement: "[REDACTED:jwt]" },
  // Nom en MAJUSCULES uniquement (style env var) : évite de masquer `key = "..."`
  // dans du code source. Pas de flag `i` — `env`/`printenv`/`.env` sont en UPPER_SNAKE.
  { name: "env_secret", tier: "mandatory", regex: /(\b[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|PWD))(\s*[=:]\s*)(['"]?)(?!\[REDACTED:)([^\s'"]{8,})\3/g, replacement: "$1$2$3[REDACTED:env_secret]$3" },
  // Heuristique de LABEL, tier "prompt" UNIQUEMENT (jamais sur les sorties d'outils :
  // "token: maVariable" y ferait un faux positif). Labels de credentials non ambigus +
  // séparateur :/= + valeur 8+ chars en charset de secret (pas de ponctuation de code,
  // ce qui écarte "access_token: process.env.X"). Attrape le mot de passe admin Stalwart
  // et le client_secret Linear collés en clair — les vecteurs de la rétro 2026-07.
  { name: "labeled_secret", tier: "prompt", regex: /\b(mot\s*de\s*passe|mdp|passe|password|passwd|pwd|client_secret|access_token|refresh_token|bot_token|admin_secret|master_password|api[_-]?key|secret[_-]?key)(\s*[:=]\s*['"]?)([A-Za-z0-9_\-+/=]{8,})/gi, replacement: "$1$2[REDACTED:labeled_secret]" },
  { name: "mac_address", tier: "mandatory", regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g, replacement: "[REDACTED:mac]" },
  // Tier "display" (pas mandatory) : le motif 3-3-4 chiffres matche des tableaux, tailles
  // et timestamps (150 300 2026, 512 512 4096) — en mandatory il corromprait le contexte
  // que Claude LIT. Masqué seulement en partage d'écran.
  { name: "phone_number", tier: "display", regex: /\b(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, replacement: "[REDACTED:phone]" },
  { name: "ipv4", tier: "display", regex: /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g, replacement: "[REDACTED:ipv4]" },
  { name: "ipv6", tier: "display", regex: /\b(?:(?:[0-9A-Fa-f]{1,4}:){1,6}:|(?:[0-9A-Fa-f]{1,4}:){7})[0-9A-Fa-f]{1,4}\b/g, replacement: "[REDACTED:ipv6]" },
  { name: "email", tier: "display", regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: "[REDACTED:email]" },
  // Chemin perso : masque le nom d'utilisateur dans /Users/<x> ou /home/<x>
  // (révèle l'identité en partage d'écran), en gardant la racine.
  { name: "perso_path", tier: "display", regex: /\/(Users|home)\/[^/\s]+/g, replacement: "/$1/[REDACTED:user]" },
];

export function redact(text: string, tiers: Tier[]): { text: string; count: number } {
  let count = 0;
  let out = text;
  for (const rule of RULES) {
    if (!tiers.includes(rule.tier)) continue;
    rule.regex.lastIndex = 0;
    out = out.replace(rule.regex, (...args) => {
      count++;
      return rule.replacement.replace(/\$(\d)/g, (_, d) => args[Number(d)] ?? "");
    });
  }
  return { text: out, count };
}

/**
 * Noms des règles qui matchent `text` dans les tiers donnés, SANS transformer.
 * Sert au hook UserPromptSubmit : il ne peut que bloquer un prompt (l'API ne permet
 * pas de le réécrire), et il ne doit jamais réémettre la valeur — seulement son TYPE.
 */
export function matchedRules(text: string, tiers: Tier[]): string[] {
  const names: string[] = [];
  for (const rule of RULES) {
    if (!tiers.includes(rule.tier)) continue;
    rule.regex.lastIndex = 0;
    if (rule.regex.test(text)) names.push(rule.name);
  }
  return names;
}
