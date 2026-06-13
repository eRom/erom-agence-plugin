#!/usr/bin/env bash
# Codex PreToolUse hook: compact `nlm notebook query` output.
# Requires: jq

if ! command -v jq &>/dev/null; then
  echo "[nlm-rewrite] WARNING: jq is not installed; command left unchanged." >&2
  exit 0
fi

INPUT=$(cat)
CMD=$(jq -r '.tool_input.command // empty' <<<"$INPUT")

if [ -z "$CMD" ]; then
  exit 0
fi

# Only rewrite a simple invocation of the exact nlm subcommand.
if [[ ! "$CMD" =~ ^[[:space:]]*nlm[[:space:]]+notebook[[:space:]]+query([[:space:]]|$) ]] ||
  [[ "$CMD" == *"|"* ]] ||
  [[ "$CMD" == *"&"* ]] ||
  [[ "$CMD" == *";"* ]] ||
  [[ "$CMD" == *"<"* ]] ||
  [[ "$CMD" == *">"* ]] ||
  [[ "$CMD" == *$'\n'* ]]; then
  exit 0
fi

REWRITTEN="$CMD --json | jq -ec '{answer: (.answer // error(.error // \"nlm notebook query failed\")), conversation_id: .conversation_id, citations: (.citations // {})}'"
UPDATED_INPUT=$(jq -c --arg cmd "$REWRITTEN" '.tool_input | .command = $cmd' <<<"$INPUT")

jq -n \
  --argjson updated "$UPDATED_INPUT" \
  '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "allow",
      "permissionDecisionReason": "Compact nlm notebook query output",
      "updatedInput": $updated
    }
  }'
