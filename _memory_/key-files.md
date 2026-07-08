# Fichiers clés — erom-agence-plugin

_Mise à jour : 2026-07-08_

## Racine

- `CLAUDE.md` — règles du monorepo : maître seul édité, variantes générées, version ISO, `dist/` gitignoré, aucune donnée d'installation en dur.
- `AGENTS.md` / `GEMINI.md` — équivalents CLAUDE.md pour les autres harness (à vérifier s'ils divergent avant de les modifier isolément).
- `package.json` — outillage du monorepo (pas le plugin lui-même).

## Génération des variantes

- `scripts/codex-generator.ts` — transpileur maître → `codex-agence-plugin/`.
- `scripts/gemini-generator.ts` — transpileur maître → `gemini-agence-plugin/`.

## Skills (maître : `claude-agence-plugin/skills/`)

- `agence-control/SKILL.md` — manuel des 18 tools MCP Caserne hors `setup_project` (identité Linear/Slack/mail par agent).
- `agence-network/SKILL.md` — manuel du swarm côté salarié (dans son pane tmux) : principes non négociables (adressage par env, agents égaux, session explicite, jamais tmux direct), référence des commandes `run -s`/`send`/`read`/`tasks`/`team`/`fire`/`clean`, tableau task vs chat, erreurs fréquentes. Modèle structurel pour les skills swarm suivants.
- `agence-orchestrate/SKILL.md` — manuel du siège externe `boss` (session principale, hors pane) : table de routage v1 (deep research → `agy`), protocole de dispatch en 5 temps (ensure-up/objective/send/wait-fond/synthèse), convention de livrables (`.claude/agence/out/<task-id>/`), rattrapages par exit code. Créé le 2026-07-08, miroir structurel d'`agence-network`.
- `onboarding/SKILL.md`, `handoff/SKILL.md`, `inbox/SKILL.md`, `pii-activate/SKILL.md`, `session-checkpoint/SKILL.md`, `session-continue/SKILL.md`, `session-end/SKILL.md` — non explorés en détail cette session.

## Docs (locales, non versionnées — `docs/` gitignoré)

- `docs/specs/YYYY-MM-DD-*-design.md`, `docs/plans/YYYY-MM-DD-*.md` — convention identique au repo control-plane voisin dans la forme, mais **jamais commitées ici** (contrairement au control-plane où `docs/` est tracké). Existent sur disque après un brainstorm/plan, à ne pas chercher dans `git log`.
