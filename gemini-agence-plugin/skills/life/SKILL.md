---
name: wiki-query
description: Répond à une question en naviguant le wiki de wiki-vault plutôt qu'en scannant les sources brutes. Lit index.md, ouvre les pages pertinentes, synthétise une réponse sourcée. Déclenche quand Romain pose une question sur ce qu'il a lu ou vu, ou dit "wiki-query", "demande au wiki", "qu'est-ce que je sais sur...".
---

> [!IMPORTANT]
> **Optimisation des ressources (modèle léger)** : Si tu es l'agent principal, tu DOIS déléguer l'intégralité de l'exécution de cette skill au sous-agent **@erom-search** via l'outil `start_subagent`. Ne l'exécute pas toi-même.

# wiki-query

Réponds à une question depuis le wiki de tous les jours qui se trouve dans : `~/dev/EROM-HQ/wiki-vault/`.

## Procédure

1. Lis `wiki-vault/wiki/index.md` - c'est ta carte. **Ne scanne ni `_raw/` ni `_ingested/`.**
2. Identifie via l'index les pages concept et source pertinentes.
3. Ouvre-les, lis-les, synthétise une réponse. Cite les pages utilisées en
   `[[liens]]`.
4. Si le wiki ne contient pas la réponse, dis-le clairement. Ne comble pas le
   trou avec des connaissances générales sans le signaler explicitement.
5. Si la réponse produite est solide et réutilisable, propose à Romain de la
   sauvegarder comme nouvelle page concept - via `wiki-ingest`, jamais en
   écriture directe.

## Garde-fou

`wiki-query` est en **lecture seule**. Tu n'écris rien dans `wiki/` - tu peux
seulement proposer une ingestion.


## Cas limites

- **Aucun résultat / fiche introuvable** → dis-le simplement, ne fabrique pas de réponse.
