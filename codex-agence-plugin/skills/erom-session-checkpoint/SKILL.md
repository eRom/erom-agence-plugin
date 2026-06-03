---
name: erom-session-checkpoint
description: "Checkpoint manuel avant /clear : commit (si repo), handoff, et dispatch du scribe qui écrit le snapshot de reprise dans _sessions_/. À lancer UNIQUEMENT sur demande explicite de l'utilisateur (/erom-session-checkpoint) - ne JAMAIS auto-déclencher, même si la conversation ressemble à une fin de session."
---

# erom-session-checkpoint

Prépare un `/clear` propre sans perdre le fil : tu produis un jeton de reprise. Le gros du travail (la substance) est délégué à un cerveau frais ; toi (contexte potentiellement saturé) tu ne fais que le strict robuste à la dégradation.

Exécuté dans le **contexte principal** (tu as besoin du contexte de session pour le handoff). Suis les étapes dans l'ordre.

## 1. Gitignore (si repo)

Si le cwd est un repo git (`git rev-parse --is-inside-work-tree`) et que `_sessions_/` n'est pas déjà ignoré : ajoute la ligne `_sessions_/` au `.gitignore`. **Avant** le commit, pour qu'elle soit committée.

## 2. Git hygiene (si repo)

`git add -A && git commit` de tout le travail en cours (règle : commit ALL). Note la branche (`git branch --show-current`) et le worktree éventuel. Si ce n'est pas un repo : saute, statut `-`.

## 3. Handoff-pointeurs

Produis un bloc court (~15 lignes max) - le seul livrable de ton contexte cramé. **Pointe, ne résume pas** :
- `intent` : le pourquoi (1-2 phrases)
- `next_step` : la première action de reprise, concrète
- `slug` : titre court kebab-case
- `pointeurs` : 3-5 repères ("décision clé sur X vers la fin", "piège Y", "voir fichier Z")
- `status` : in-progress | blocked | ready-to-ship
- `linear` / `slack` : si projet erom (lus depuis le bloc `<caserne-project>` injecté au démarrage, source `_memory_/ONBOARD.md`), sinon `-`

## 4. Routage durable

- Faits durables globaux → `memory/` + pointeur dans `MEMORY.md`.
- Si projet erom : déclenche le skill `erom-session-end` (→ carto `_memory_/`).

## 5. Résolution du transcript

```bash
SCRIPT="${PLUGIN_ROOT:-}/skills/erom-session-checkpoint/scripts/condense-transcript.ts"
[ -f "$SCRIPT" ] || SCRIPT="<base dir de ce skill>/scripts/condense-transcript.ts"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
TRANSCRIPT="$(bun "$SCRIPT" --print-codex-transcript --cwd "$(pwd -P)" --codex-home "$CODEX_HOME_DIR")"
[ -n "$TRANSCRIPT" ] || { echo "Transcript Codex introuvable dans $CODEX_HOME_DIR/sessions" >&2; exit 1; }
```

Cible le transcript Codex local depuis `$CODEX_HOME/sessions` (défaut : `~/.codex/sessions`). Le script parcourt les `rollout-*.jsonl` du plus récent au plus ancien, lit `session_meta.cwd`, et choisit le premier transcript dont le cwd réel correspond au repo courant. À défaut, il retombe sur le transcript Codex le plus récent. À résoudre **dans le contexte principal** : lui seul connaît le bon cwd de reprise avant dispatch du scribe.

## 6. Dispatch du scribe

Appelle le subagent `erom-scribe` (outil de sous-agent Codex, agent `erom-scribe`). Passe-lui dans le prompt : le handoff-pointeurs, le path du transcript (étape 5), le path du script `<base dir de ce skill>/scripts/condense-transcript.ts`, le dossier `_sessions_/` cible, le timestamp `YYYYMMDD-HH_MM`, le slug. Il écrit le fichier et te renvoie `path` + `next_step`.

## 7. Resume final

Affiche : opérations faites (git, mémoire, fichier `_sessions_/` créé) + le **NEXT STEP** renvoyé par le scribe, puis « ✅ tu peux /clear ».

---

**Ordre critique** : gitignore (1) avant commit (2) ; le scribe (6) écrit dans `_sessions_/` après le commit → le snapshot n'est jamais committé.
