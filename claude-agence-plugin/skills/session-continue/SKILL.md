---
name: session-continue
description: "Reprise de session après /clear ou coupure quota : détecte le marqueur session limit, charge le dernier snapshot _sessions_/ (eager : Objectif + NEXT STEP ; lazy : le reste) ou l'état TaskList, restaure le contexte git, et annonce où on reprend. Déclenchement explicite (/session-continue)."
user-invocable: true
disable-model-invocation: true
---

# session-continue

Reprend le travail après un `/clear` ou une coupure quota, sans relire toute la session. Le but est une reprise **légère** : tu ne charges que le minimum, le reste à la demande.

## 0. Détecter une coupure quota

Vérifie si la session précédente s'est terminée en coupure (et non sur un checkpoint volontaire) :

```bash
DIR="$HOME/.claude/projects/$(pwd | sed 's#[/.]#-#g')"
tail -c 4000 "$(ls -t "$DIR"/*.jsonl 2>/dev/null | head -1)" | grep -q "hit your session limit" && echo COUPURE
```

En mode coupure : ne relis **pas** le transcript entier (gonflé, cache froid - c'est la confusion de reprise documentée par l'audit). Repars de **TaskList** (l'état ancré au fil de l'eau pendant la tâche) plus les tout derniers tours du transcript pour la micro-position. Un snapshot `_sessions_/` peut exister mais dater du dernier checkpoint volontaire, bien avant la coupure : compare sa date au transcript et signale l'écart au lieu de le suivre aveuglément. Poursuis ensuite en 1→4 avec cette réserve.

## 1. Localiser le snapshot

`glob _sessions_/*.md` → trie par nom (le préfixe `YYYYMMDD-HH_MM` rend le tri lexicographique = chronologique) → prends le **dernier**. Si un argument est fourni, cible-le. Si plusieurs candidats ambigus, liste-les et demande.

Si `_sessions_/` est vide ou absent : dis-le et arrête (rien à reprendre).

## 2. Eager-load (minimal)

Lis **uniquement** le frontmatter + la section `🎯 Objectif` + la section `👉 NEXT STEP`.

Les autres sections (`🧠 Décisions`, `📍 État`, `⚠️ Pièges`, `🔗 Pointeurs`, `💎`) restent en **lazy** : ne les lis QUE si la reprise le nécessite réellement. C'est tout l'intérêt - ne pas ré-engloutir le contexte au démarrage.

## 3. Restaurer le contexte git (si applicable)

Si le frontmatter a un `worktree` ≠ `-` : `cd` dedans. Vérifie la branche (`git branch --show-current`) ; si elle diffère de `branch` et que l'arbre de travail est propre, bascule (`git switch <branch>`) ; sinon signale-le sans forcer. Tout en lecture/navigation, rien de destructif.

## 4. Annoncer

« Reprise : **<title>**. Next : <next_step>. Je charge le détail (Décisions / Pièges) au besoin. »
