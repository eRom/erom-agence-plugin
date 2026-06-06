---
name: erom-cortex
description: "Interroge le cortex technique central via le MCP erom-cortex-mcp, en deux phases pilotées - recherche → liste sélectionnable, puis lecture des fiches choisies → réponse ancrée + sources. Déclenche dès que Romain veut consulter SON cortex / vault / savoir technique : 'recherche dans le cortex', 'interroge le cortex', 'cherche dans le vault', 'que dit mon cortex sur X', '/erom-cortex', ou veut faire lire des fiches précises du vault. Ne pas déclencher pour une question technique générale sans référence au cortex."
---

> [!IMPORTANT]
> **Optimisation des ressources (modèle léger)** : Si tu es l'agent principal, tu DOIS déléguer l'intégralité de l'exécution de cette skill au sous-agent **@erom-search** via l'outil `start_subagent`. Ne l'exécute pas toi-même.

# erom-cortex

Interroge le cortex technique de Romain et en restitue une réponse propre et ancrée. Tu tournes dans un **fork** : le JSON brut du MCP et le contenu des fiches restent chez toi, seul le distillat (liste ou réponse) repart vers la session appelante. C'est tout l'intérêt - garder le bruit hors du contexte principal.

## Deux phases, une seule par appel

Un fork rend la main une fois : il ne peut pas afficher une liste, attendre un choix, puis continuer. Le choix humain vit donc dans la session appelante. Regarde ce qu'on te passe et route :

- **Une question / des mots-clés, sans fiche désignée** → **Phase 1** (chercher et lister).
- **Des fiches à ouvrir** (chemins, noms de fiches, ou « lis ces sources : … » + une question) → **Phase 2** (lire et synthétiser).

La « porte alternative » (Romain te donne directement des fiches à lire) n'est pas un cas spécial : c'est la Phase 2 appelée d'emblée.

## Phase 1 - Recherche

1. Appelle `query_cortex_vault({ query: <la question> })`. Garde `limit` au défaut ; monte vers 8 seulement si la question est large.
2. La réponse contient `wikiPath` et `results[]` (`rank`, `path`, `title`, `type`, `snippet`).
3. Rends **uniquement** une liste numérotée, une fiche par ligne, avec son **chemin absolu** - c'est ce qui permettra de te rappeler en Phase 2 sans relancer la recherche :

   ```
   N. **{title}** · _{type}_ · {un fragment de contexte tiré du snippet, nettoyé des « … »} - {wikiPath}/{path}
   ```

4. Termine par une invite courte : `Lesquelles veux-tu que j'ouvre ? (ex. 1, 3, 5)`.
5. **Ne donne aucune réponse de fond ici.** Le snippet est tronqué et bruité ; il sert d'indice pour choisir, pas de contenu. Ne le recopie pas en vrac.
6. Si deux fiches ont des titres quasi identiques (le wiki en génère des doublons : `macos-native-integration` / `macos-native-integrations`…), signale-le d'un mot pour que Romain ne les ouvre pas en double.
7. Si `count` vaut 0 : dis-le franchement et propose une reformulation. Ne lis rien.

Puis arrête-toi : la liste repart vers la session appelante, le choix se fait là-bas.

## Phase 2 - Lecture + synthèse

Entrée : une question + un ensemble de fiches (chemins absolus, chemins `wiki/…`, ou noms/slugs/titres de fiches).

1. **Résous chaque fiche en chemin lisible :**
   - chemin absolu ou `wiki/…` → lis directement ;
   - juste un nom/slug/titre → cherche le fichier sous `wiki/concepts/` et `wiki/satellites/` (Glob) ; en dernier recours, un seul `query_cortex_vault({ query: <nom>, limit: 3 })` pour le **localiser** (localiser, pas raffiner la recherche).
2. **Lis** chaque fiche choisie.
3. Récupère le champ `sources` du frontmatter YAML de chaque fiche (liste de `[[wikilinks]]` vers les fichiers repo d'origine).
4. **Rédige une réponse directe à la question**, ancrée dans le contenu lu. Synthétise et croise les fiches - pas un résumé fiche par fiche. Reste dans ce que disent les fiches : si elles ne couvrent pas un aspect de la question, dis-le plutôt que de combler avec des connaissances générales. La valeur d'un cortex, c'est de répondre depuis le savoir de Romain, pas de paraphraser Wikipedia.
5. Termine par une section **Sources** : une ligne par fiche lue, la fiche en `[[wikilink]]` (nom de fichier sans extension) suivie de ses `sources` de frontmatter.

Format de sortie :

```
{réponse synthétique, directe, croisée}

---
**Sources**
- [[macos-native-security]] → [[api-key-manager/README.md]], [[spokes/enplace/README.md]]
- [[api-key-manager]] → [[api-key-manager/GEMINI.md]], [[api-key-manager/docs/…]]
```

Ne renvoie que ça : la réponse + les sources. C'est le bloc self-contained que Romain ramène vers Opus.

## Cas limites

- **Aucun résultat / fiche introuvable** → dis-le simplement, ne fabrique pas de réponse.
- **Fiches lues hors-sujet** → signale que le cortex ne couvre pas la question sous cet angle, et propose de relancer une recherche avec d'autres termes (Phase 1).
