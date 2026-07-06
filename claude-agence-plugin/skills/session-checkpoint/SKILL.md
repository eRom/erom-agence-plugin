---
name: session-checkpoint
description: "Checkpoint manuel avant /clear : commit (si repo), handoff, et dispatch du scribe qui écrit le snapshot de reprise dans _sessions_/. À lancer UNIQUEMENT sur demande explicite de l'utilisateur (/session-checkpoint) - ne JAMAIS auto-déclencher, même si la conversation ressemble à une fin de session."
user-invocable: true
disable-model-invocation: true
---

# session-checkpoint

Prépare un `/clear` propre sans perdre le fil : tu produis un jeton de reprise. Le gros du travail (la substance) est délégué à un cerveau frais ; toi (contexte potentiellement saturé) tu ne fais que le strict robuste à la dégradation.

Exécuté dans le **contexte principal** (tu as besoin du contexte de session pour le handoff). Suis les étapes dans l'ordre.

## Limite structurelle (et son filet)

Ce checkpoint est un geste **volontaire** : il ne protège pas d'une coupure quota, qui EST l'échec de l'appel API (aucun tour ne s'exécute pour écrire quoi que ce soit). Le filet pour ce scénario se pose en amont : pendant toute tâche longue, ancre l'état au fil de l'eau dans **TaskCreate/TaskUpdate** (statut et prochaine action à jour à chaque jalon). Cet état survit à la coupure, et `session-continue` sait repartir de là même sans snapshot.

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
- `linear` / `slack` : si projet erom (lus depuis `_memory_/ONBOARD.md`), sinon `-`

## 4. Routage durable

- Faits durables globaux → `memory/` + pointeur dans `MEMORY.md`.
- Si projet erom : déclenche le skill `session-end` (→ carto `_memory_/`).

## 5. Résolution du transcript

```bash
DIR="$HOME/.claude/projects/$(pwd | sed 's#[/.]#-#g')"
TRANSCRIPT="${CLAUDE_CODE_SESSION_ID:+$DIR/$CLAUDE_CODE_SESSION_ID.jsonl}"
[ -f "$TRANSCRIPT" ] || TRANSCRIPT="$(ls -t "$DIR"/*.jsonl 2>/dev/null | head -1)"
```

Cible **déterministe** le transcript de cette session via `$CLAUDE_CODE_SESSION_ID` (exposé par Claude Code), avec repli sur le `.jsonl` le plus récent (`mtime`). À résoudre **dans le contexte principal** : lui seul porte le bon session id (le scribe est un subagent).

## 6. Dispatch du scribe

Appelle le subagent `caserne-scribe` (tool Agent, `subagent_type: caserne-scribe`). Passe-lui dans le prompt : le handoff-pointeurs, le path du transcript (étape 5), le path du script `<base dir de ce skill>/scripts/condense-transcript.ts`, le dossier `_sessions_/` cible, le timestamp `YYYYMMDD-HH_MM`, le slug. Il écrit le fichier et te renvoie `path` + `next_step`.

## 7. Resume final

Affiche : opérations faites (git, mémoire, fichier `_sessions_/` créé) + le **NEXT STEP** renvoyé par le scribe, puis « ✅ tu peux /clear ».

---

**Ordre critique** : gitignore (1) avant commit (2) ; le scribe (6) écrit dans `_sessions_/` après le commit → le snapshot n'est jamais committé.
