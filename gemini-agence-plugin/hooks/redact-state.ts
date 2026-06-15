// État du "mode partage d'écran", partagé par les deux hooks.
// off (défaut) : seul le tier `mandatory` est rédigé (credentials partout).
// on  : on ajoute le tier `display` (IP, emails, chemins perso) - le temps d'une démo.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Tier } from "./redact-rules.ts";

// État GLOBAL du masquage PII : une préférence transversale (un partage d'écran
// concerne toutes les sessions/projets), stockée dans ~/.config/caserne/pii.
// NE PAS dériver de import.meta.url / GEMINI_PLUGIN_ROOT : ça pointe vers le cache
// du plugin (read-only, partagé, écrasé aux updates). Surchargeable par env pour
// isoler les tests. Évalué à chaque appel (lazy).
function stateFile(): string {
  return process.env.REDACT_SHARE_FILE ?? join(homedir(), ".config", "caserne", "pii");
}

export function isShareOn(): boolean {
  try {
    const f = stateFile();
    return existsSync(f) && readFileSync(f, "utf8").trim() === "on";
  } catch {
    return false;
  }
}

export function setShare(on: boolean): void {
  const f = stateFile();
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, on ? "on" : "off");
}

/** Tiers à appliquer selon le mode courant. `mandatory` toujours ; `display` en partage. */
export function currentTiers(): Tier[] {
  return isShareOn() ? ["mandatory", "display"] : ["mandatory"];
}
