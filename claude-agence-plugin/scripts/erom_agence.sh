#!/usr/bin/env bash
# erom_agence.sh - Agent de la session courante (plugin Claude).
# Vaut 'claude', ou 'deepseek' si l'API Anthropic est routee vers DeepSeek
# (client Claude Code + ANTHROPIC_BASE_URL). C'est le SEUL agent qui varie a
# runtime dans ce plugin : on est toujours dans le client Claude, seul le backend
# bouge. Les variantes Gemini/Codex remplacent ce fichier par leur constante
# (EROM_AGENCE_AGENT=gemini|codex) via le transpileur.
#
# Sourcé par le hook SessionStart -> expose $EROM_AGENCE_AGENT.
# Un override explicite EROM_AGENCE_AGENT (tests/forçage) est respecté.
if [ -z "${EROM_AGENCE_AGENT:-}" ]; then
    case "${ANTHROPIC_BASE_URL:-}" in
        *deepseek.com*) EROM_AGENCE_AGENT="deepseek" ;;
        *)              EROM_AGENCE_AGENT="claude" ;;
    esac
fi
export EROM_AGENCE_AGENT
printf '%s\n' "$EROM_AGENCE_AGENT"
