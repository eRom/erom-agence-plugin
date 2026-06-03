---
name: erom-search
description: Recherche hybride et unifiée dans TOUTE la connaissance de Romain. Interroge le Wiki technique, les mémoires consolidées des projets, et l'historique des conversations Claude Code. Déclenche ce skill pour toute commande '/erom-search "query"' ou recherche globale comme "qu'est-ce qu'on avait fait sur X", "retrouve les décisions sur Y", "recherche sémantique Z".
---

> [!IMPORTANT]
> **Optimisation des ressources (modèle léger)** : Si tu es l'agent principal, tu DOIS déléguer l'intégralité de l'exécution de cette skill au sous-agent **@erom-quick** via l'outil `start_subagent`. Ne l'exécute pas toi-même.

# erom-search

## Ce que c'est
Un agrégateur haute performance en TypeScript (Bun) qui fusionne en parallèle les trois sources de connaissances de Romain :
1. **Cortex Vault** : Le RAG sémantique et lexical sur le Wiki technique Gerber (satellites + concepts).
2. **search-memories** : Le CLI Rust scannant les mémoires cross-projets rédigées par Claude Code.
3. **search-sessions** : Le CLI Rust effectuant une recherche full-text deep dans l'historique de tes discussions Claude Code.

---

## Workflow d'exécution

### 1. Lancer la recherche consolidée
Exécute la recherche en passant la query extraite de la demande de l'utilisateur :

Le path du script : `<base dir de ce skill>/scripts/search.ts`

```bash
bun run <script_path>/scripts/search.ts "<query>"
```

### 2. Présenter les résultats
Affiche directement la sortie YAML générée par le script dans un bloc de code `yaml`. Chaque résultat à travers toutes les catégories possède un identifiant unique et séquentiel global (`id: "#1"`, `id: "#2"`...) qui se suit chronologiquement pour te permettre (ou à Romain) de désigner précisément une source. Ne modifie pas la sortie ni ne la résume excessivement.

### 3. Exploiter les sources trouvées
- **Wiki technique** (cortex.results) : Ouvre le fichier correspondant listé dans le champ `path` (ex: `~/.config/gerber-vault/wiki/...`).
- **Mémoire projet** (memories.results) : Tu peux lire le fichier complet de mémoire dans le dossier du projet Claude Code indiqué dans le champ `path`.
- **Historique de chat** (sessions.results) : Tu disposes de l'UUID complet de la session dans le champ `session_id` pour reprendre la conversation (ex: `claude -r <session_id>`).
