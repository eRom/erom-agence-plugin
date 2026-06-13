#!/usr/bin/env bash
# Test de caserne_session_start.sh : identité résolue + contenu injecté.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

tmp_home="$(mktemp -d)"
empty_home="$(mktemp -d)"
trap 'rm -rf "$tmp_home" "$empty_home"' EXIT
mkdir -p "$tmp_home/.config/caserne"
cat > "$tmp_home/.config/caserne/CASERNE.md" <<'EOF'
# CASERNE - test
## Agents
| Agent  | Slack ID    | Linear ID | Email |
| Claude | U0EXAMPLE01 | LINEXAMPLE | agent-claude@example.com |
EOF

fail() { echo "FAIL: $1"; exit 1; }

# Simule une session Codex (CODEX=1) ; le plugin root = le dossier parent (hooks/..).
out="$(HOME="$tmp_home" CODEX=1 PLUGIN_ROOT="$here/.." bash "$here/caserne_session_start.sh")"

echo "$out" | grep -q '<caserne-self>'              || fail "pas d'en-tête self"
echo "$out" | grep -qiE 'agent courant *: *claude'  || fail "agent non résolu"
echo "$out" | grep -q 'U0EXAMPLE01'                 || fail "ligne self absente"
echo "$out" | grep -q '# CASERNE - test'            || fail "contenu non injecté"

# Cas fichier absent : sortie vide, exit 0.
out2="$(HOME="$empty_home" CODEX=1 PLUGIN_ROOT="$here/.." bash "$here/caserne_session_start.sh")"
[ -z "$out2" ] || fail "devrait être silencieux sans CASERNE.md"

echo "PASS"
