#!/usr/bin/env bash
# caserne_session_start.sh - Hook SessionStart du plugin caserne.
# Injecte l'identité de l'agent courant + le référentiel ~/.config/CASERNE.md
# (contexte agence) + le _memory_/ONBOARD.md du repo courant (contexte projet, si présent).
# Tout le stdout est injecté comme contexte de session par Claude Code.
set -euo pipefail

CASERNE_FILE="$HOME/.config/CASERNE.md"

# Rien à injecter si le référentiel n'existe pas : sortie propre.
[ -f "$CASERNE_FILE" ] || exit 0

# Détection de l'agent courant via le détecteur partagé (source -> $EROM_AGENCE_AGENT,
# support Antigravity inclus). Sous-shell + set +e : on isole le sourcing du set -e du hook.
agent_key="$(set +e; . "${GEMINI_PLUGIN_ROOT}/scripts/erom_agence.sh" >/dev/null 2>&1; printf '%s' "${EROM_AGENCE_AGENT:-unknown}")"

# Ligne self extraite de la table ## Agents (DRY : la source reste CASERNE.md).
self_line="$(grep -iE "^\|[[:space:]]*${agent_key}[[:space:]]*\|" "$CASERNE_FILE" 2>/dev/null || true)"

echo "<caserne-self>"
if [ -n "$self_line" ]; then
  echo "Agent courant : ${agent_key}. Ta ligne dans la table Agents :"
  echo "$self_line"
else
  echo "Agent courant : ${agent_key} (aucune ligne self trouvée dans CASERNE.md)."
fi
echo "</caserne-self>"
echo ""
cat "$CASERNE_FILE"

# Contexte projet : IDs par-repo (Linear project + canal Slack) si on est dans un
# projet eRom onboardé. Source : <repo>/_memory_/ONBOARD.md (écrit par onboarding).
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
project_file="${repo_root:+$repo_root/_memory_/ONBOARD.md}"
if [ -n "$project_file" ] && [ -f "$project_file" ]; then
  echo ""
  echo "<caserne-project>"
  cat "$project_file"
  echo "</caserne-project>"
fi
