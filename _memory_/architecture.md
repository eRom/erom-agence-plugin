# Architecture — erom-agence-plugin

_Mise à jour : 2026-07-08_

**Type** : monorepo de dev pour un **plugin d'agents IA de codage**, nom distribué `caserne`, open source.
**Objectif** : donner à un agent IA (Claude Code, Codex, Antigravity/Gemini) le manuel opératoire (skills) pour travailler dans l'agence eRom via le control-plane **caserne** (repo voisin `erom-agence-control-plane` : CLI + MCP).

## Trois variantes, un maître

| Variante | Dossier | Rôle | Installation |
|---|---|---|---|
| Claude Code | `claude-agence-plugin/` | **maître**, seul édité à la main | git-subdir (marketplace `erom-marketplace`) |
| Codex | `codex-agence-plugin/` | **généré** | git-subdir (marketplace) |
| Antigravity/Gemini | `gemini-agence-plugin/` | **généré** | install directe (repo/sous-dossier, pas encore de marketplace côté Google) |

Les variantes générées sortent d'un **transpileur déterministe** (`scripts/codex-generator.ts`, `scripts/gemini-generator.ts`) — jamais d'édition directe dedans. Un seul numéro de version, ISO entre les 3 variantes + les 2 entrées marketplace.

## Distribution

Un seul repo public, trois chemins d'installation (git-subdir marketplace, install directe, release zip pour contextes air-gap — zips en assets de release, jamais commités, `dist/` gitignoré). Aucune donnée propre à l'installation (IDs Slack/Linear, emails, chemins `/Users/...`) dans le code distribué : ça vit dans la config locale (`~/.config/caserne/CASERNE.md`), résolue au runtime.

## Les skills (`claude-agence-plugin/skills/`)

Chacun un `SKILL.md` (frontmatter YAML + prose), consommé par l'agent hôte comme manuel opératoire :
- `agence-control` — manuel des tools MCP Caserne (identité Linear/Slack/mail sous son propre nom).
- `agence-network` — manuel du salarié **dans son pane** tmux (swarm : run -s/send/read/tasks/team/fire/clean).
- `agence-orchestrate` — doctrine du chef d'orchestre en session principale, **hors pane** (siège externe `boss` : dispatch/wait/synthèse vers un salarié du réseau). Complément symétrique d'`agence-network`.
- `onboarding` — bootstrap d'un projet (`setup_project` + GitHub + RAG).
- `handoff`, `inbox`, `pii-activate`, `session-checkpoint`, `session-continue`, `session-end` — workflows de session/projet, niveau plus haut.

Philosophie constante : **le CLI/MCP `caserne` est la source de vérité de la mécanique ; le skill enseigne le quand et le pourquoi.**

## Dépendance externe critique

Le CLI `caserne` (repo voisin `erom-agence-control-plane`) : toute commande/flag/exit-code/message cité dans un skill doit exister réellement dans ce CLI — les skills sont un contrat de doc envers une surface qui évolue de l'autre côté (voir gotchas.md).

## Docs de dev (specs/plans)

`docs/` est **gitignoré à la racine** (`/docs/`) : specs et plans de brainstorm/plan restent **locaux uniquement**, jamais versionnés, contrairement au repo control-plane voisin où `docs/` est tracké. Piège à connaître avant de tenter un commit dessus (voir gotchas.md).
