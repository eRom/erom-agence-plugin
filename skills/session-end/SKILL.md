---
name: session-end
description: "Cartographie de fin de session : persiste la connaissance projet dans _memory_/. Déclenche quand l'utilisateur demande explicitement de clore en persistant : 'fin de session', 'end session', 'sauvegarde le contexte projet', 'mets à jour la mémoire projet', 'cartographie le projet avant de fermer'. Ne déclenche JAMAIS sur une simple formule de politesse ('au revoir', 'merci', 'bonne journée') sans demande de persistance."
user-invocable: true
---

# session-end

Capture l'état de connaissance actuel du projet dans `_memory_/` pour que la prochaine session démarre sans phase de redécouverte. Utiliser le contexte accumulé pendant la session — **ne pas re-scanner tout le projet**.

## Fichiers à générer/mettre à jour

Si `_memory_/` n'existe pas, le créer.

Le skill possède **exactement ces 4 fichiers**. Ne touche à rien d'autre dans `_memory_/` : `ONBOARD.md`, `audit/` et le reste du dossier appartiennent à d'autres outils.

**`_memory_/architecture.md`** : type, objectif, stack, arborescence simplifiée des dossiers clés, couches/modules et communication, flux de données principaux, dépendances externes critiques.

**`_memory_/key-files.md`** : fichiers les plus importants. Pour chacun : chemin, rôle, contenu en 1 ligne. Regroupés par module/domaine. Inclure configs critiques (env, CI).

**`_memory_/patterns.md`** : conventions de nommage, patterns architecturaux (repository, service, controller…), patterns de code récurrents (error handling, logging, auth), style de tests, conventions commit/branching si observées.

**`_memory_/gotchas.md`** : pièges, bugs résolus + cause racine, configs subtiles, points d'attention, workarounds + pourquoi.

## Règles d'écriture

- **Concis** : chaque fichier lisible en 30 secondes.
- **Factuel** : pas de suppositions, uniquement ce qui a été vérifié.
- **Merge** : si les fichiers existent, mettre à jour plutôt qu'écraser. Ne JAMAIS supprimer d'info existante sauf si devenue fausse ou obsolète.
- **No-op** : ne réécris un fichier que si la session a apporté du contenu nouveau ou corrigé pour ce fichier ; rafraîchir la date seule ne justifie pas une écriture.
- **Date** : ajouter la date de dernière mise à jour en haut de chaque fichier mis à jour.
- À la **création** d'un fichier sans matière : placeholder `Aucun élément identifié pour le moment`.

## Output

```
Session cartographiée : <YYYY-MM-DD | HH:MM> (fichiers mis à jour : <liste>)
```

Si la session n'a rien appris de nouveau : ne rien écrire et répondre `Rien de neuf à cartographier.`
