# caserne

> Helpers d'orchestration cross-projet et cross-agent pour les agents IA de codage.

`caserne` mutualise, entre plusieurs agents IA, les briques d'orchestration d'un même studio : handoffs via Linear, accès Slack et RAG via serveurs MCP, onboarding de projet et reprise de session. Le plugin **Claude Code** est le maître ; les variantes **Codex** et **Antigravity/Gemini** en sont générées automatiquement. Distribué en open source - version actuelle : **2.7.0**.

---

## 1. Usage

### Agents

Sous-agents internes, réservés au champ `agent:` des skills (pas d'invocation libre).

| Agent | Modèle | Rôle |
| --- | --- | --- |
| `erom-builder` | sonnet | Orchestrateur d'init eRom (onboarding projet + setup agence) - écrit les fichiers et commits. |
| `erom-quick` | haiku | Agrégateur lecture seule pour les skills eRom. |
| `erom-reader` | sonnet | Agrégateur lecture seule pour les skills eRom (inbox). |
| `erom-scribe` | sonnet | Écrit le snapshot de reprise dans `_sessions_/` à partir d'un transcript condensé + l'état git. Dispatché par `erom-session-checkpoint`. |
| `erom-search` | haiku | Recherche sur le wiki life et cortex. |

### Hooks

| Événement | Script | Rôle |
| --- | --- | --- |
| `SessionStart`, `PostCompact` | `caserne_session_start.sh` | Résout l'identité de l'agent courant et injecte le contenu de `~/.config/CASERNE.md` (bloc `<caserne-self>`) au démarrage et après chaque compaction. |

### Skills

| Skill | Rôle |
| --- | --- |
| `erom-agence-onboarding` | Bootstrap d'un projet eRom : repo GitHub privé, Linear Project (team EAT), canal Slack privé, structure locale. |
| `erom-cortex` | Interroge le cortex technique (`gerber-vault`) via le MCP `erom-cortex-mcp`, en deux phases : recherche → liste sélectionnable → lecture des fiches choisies → réponse ancrée + sources. |
| `erom-handoff` | Transfère le contexte de la session courante dans une issue Linear (projet Handoffs) pour le reprendre ailleurs. |
| `erom-inbox` | Vue agrégée du projet courant : issues Linear actives + inbox Slack du canal projet. |
| `erom-search` | Interroge le wiki life. Lecture des fiches choisies → réponse ancrée + sources. |
| `erom-session-checkpoint` | Checkpoint manuel avant `/clear` : commit (si repo), handoff, et dispatch du scribe qui écrit le snapshot dans `_sessions_/`. |
| `erom-session-continue` | Reprise de session après `/clear` : recharge le dernier snapshot `_sessions_/` et restaure le contexte git. |
| `erom-session-end` | Cartographie de fin de session : persiste `_memory_/`. |

### Serveurs MCP

| Serveur | Rôle | Variables |
| --- | --- | --- |
| `erom-slack-mcp` | Accès Slack (lecture/écriture des canaux, inbox). | `CASERNE_SLACK_MCP_SERVER`, `CLAUDE_SLACK_BOT_TOKEN` |
| `erom-cortex-mcp` | Requêtes RAG sur le cortex / vault technique. | `CASERNE_VAULT_MCP_SERVER` |

---

## 2. Installation

### Prérequis

- [Bun](https://bun.sh) - runtime des scripts et des serveurs MCP.
- Un fichier `~/.config/CASERNE.md` décrivant l'identité de tes agents (IDs Slack/Linear, emails). Propre à ton installation, résolu au runtime.
- Variables d'environnement, selon les composants utilisés :
  - `CASERNE_SLACK_MCP_SERVER`, `CASERNE_VAULT_MCP_SERVER` - chemins des serveurs MCP.
  - `CASERNE_VAULT_PATH` - racine du vault (pour `erom-cortex`).
  - `CLAUDE_SLACK_BOT_TOKEN` / `CODEX_SLACK_BOT_TOKEN` / `GEMINI_SLACK_BOT_TOKEN` - token du bot Slack, selon l'agent.

### Claude Code

Via le marketplace :

```
/plugin marketplace add eRom/erom-marketplace
/plugin install caserne@erom-marketplace
```

### Codex

Via le marketplace agents `eRom/erom-marketplace` (entrée `caserne`), qui pointe le sous-dossier `codex-agence-plugin/` du repo `eRom/erom-agence-plugin`.

### Antigravity / Gemini

Installation directe depuis le sous-dossier du repo (Google n'a pas encore documenté de marketplace pour Antigravity) : pointe Antigravity vers le dossier `gemini-agence-plugin/` du repo `eRom/erom-agence-plugin`.

---

## Licence

MIT © Romain Ecarnot
