---
name: notebooklm
description: "Pilote NotebookLM via la CLI `nlm`. Trois usages : lancer une deep research web sur une query et importer les sources trouvées, interroger les sources d'un notebook en Q&A, gérer/nettoyer notebooks et sources. Déclenche sur 'nlm', 'notebooklm', 'notebook lm', 'deep research notebooklm', 'interroge mes sources', ou toute automatisation NotebookLM en ligne de commande."
user-invocable: true
---

# notebooklm

Pilote NotebookLM en **CLI `nlm` uniquement**. On n'utilise jamais la version MCP.

Pour le détail d'une commande : `nlm <commande> --help`.

## Règles

- **Auth d'abord.** `nlm login` avant toute opération. La session expire en ~20 min : si une commande échoue sur une erreur d'auth (« Cookies have expired »), relance `nlm login`.
- **Capture les IDs.** `notebook create` et `research start` renvoient des IDs nécessaires aux étapes suivantes.
- **Alias plutôt que UUID.** `nlm alias set <nom> <uuid>` une fois, puis utilise `<nom>` partout.
- **Jamais de REPL.** N'utilise pas `nlm chat start` (interactif, non pilotable). Pour le Q&A, c'est `nlm notebook query`.
- **Suppression : demander avant.** Toute commande `delete` est **irréversible**. Montre ce qui va être supprimé, demande confirmation explicite à Romain, puis exécute avec `--confirm`.

## Cas 1 - Deep research sur une query

Crée un notebook dédié, lance une recherche web profonde (~5 min, ~40 sources), puis importe les sources découvertes.

```bash
# 1. Notebook dédié → capture NOTEBOOK_ID
nlm notebook create "AI Trends Research 2026"

# 2. Alias
nlm alias set research <notebook-id>

# 3. Deep research (~5 min) → capture TASK_ID
nlm research start "agentic AI and autonomous systems trends 2026" --notebook-id research --mode deep

# 4. Suivre la progression (poll jusqu'à fin ou timeout)
nlm research status research --max-wait 300

# 5. Voir les sources découvertes
nlm research status research --full

# 6. Importer toutes les sources découvertes
nlm research import research <task-id>
```

## Cas 2 - Interroger les sources

```bash
# Question one-shot
nlm notebook query <notebook-id> "What are the main themes across these sources?"
# → capture CONVERSATION_ID depuis la sortie

# Relance (garde le contexte)
nlm notebook query <notebook-id> "Can you elaborate on the first theme?" --conversation-id <conv-id>
```

## Cas 3 - Gérer / nettoyer

```bash
# 1. Lister les notebooks
nlm notebook list

# 2. Inspecter avant suppression
nlm notebook get <notebook-id>
nlm source list <notebook-id>

# 3. Supprimer une source (après confirmation de Romain)
nlm source delete <source-id> --confirm

# 4. Supprimer un notebook entier (après confirmation de Romain)
#    Avertir : supprime DÉFINITIVEMENT le notebook ET tout son contenu.
nlm notebook delete <notebook-id> --confirm

# 5. Nettoyer les alias
nlm alias delete <alias-name>
```

## Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| « Cookies have expired » / « authentication may have expired » | Session expirée | `nlm login` |
| « Notebook not found » | Mauvais ID | `nlm notebook list` |
| « Source not found » | Mauvais ID | `nlm source list <nb-id>` |
| « Research already in progress » | Recherche en attente | Importer d'abord, ou `--force` |
| « Google API error code 3 » | Erreur transitoire de deep research | Réessayer dans quelques minutes |
