---
name: session-end
description: "Cartographie de fin de session : persiste _memory_/. Triggers : Fin de session, end session, au revoir, bonne nuit."
---

# session-end

Capture l'état de connaissance actuel du projet dans `_memory_/` pour que la prochaine session démarre sans phase de redécouverte. Utiliser le contexte accumulé pendant la session - **ne pas re-scanner tout le projet**.

## Fichiers à générer/mettre à jour

Si `_memory_/` n'existe pas, le créer.

**`_memory_/architecture.md`** : type, objectif, stack, arborescence simplifiée des dossiers clés, couches/modules et communication, flux de données principaux, dépendances externes critiques.

**`_memory_/key-files.md`** : fichiers les plus importants. Pour chacun : chemin, rôle, contenu en 1 ligne. Regroupés par module/domaine. Inclure configs critiques (env, CI).

**`_memory_/patterns.md`** : conventions de nommage, patterns architecturaux (repository, service, controller…), patterns de code récurrents (error handling, logging, auth), style de tests, conventions commit/branching si observées.

**`_memory_/gotchas.md`** : pièges, bugs résolus + cause racine, configs subtiles, points d'attention, workarounds + pourquoi.

## Règles d'écriture

- **Concis** : chaque fichier lisible en 30 secondes.
- **Factuel** : pas de suppositions, uniquement ce qui a été vérifié.
- **Merge** : si les fichiers existent, mettre à jour plutôt qu'écraser. Ne JAMAIS supprimer d'info existante sauf si devenue fausse ou obsolète.
- **Date** : ajouter la date de dernière mise à jour en haut de chaque fichier.
- Si tu n'as rien à mettre dans un fichier, placeholder : `Aucun élément identifié pour le moment`.

## Output

```
Session cartographiée : <YYY-MM-DD | HH:MM>
```
