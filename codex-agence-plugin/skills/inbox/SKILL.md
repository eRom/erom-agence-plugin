---
name: inbox
description: "Vue agrégée de ce qui demande attention sur le projet eRom courant : les issues Linear actives du projet + l'inbox Slack du canal projet. Lit l'identité projet (Linear Project ID + Channel Slack ID) depuis le bloc <caserne-project> injecté au démarrage (source : _memory_/ONBOARD.md). Déclenche dès que l'utilisateur veut faire le point sur le projet : 'inbox', 'ma boîte', 'quoi de neuf sur le projet', 'qu'est-ce qui m'attend', 'les issues en cours', 'où on en est', 'check le projet', 'messages en attente'."
---

> [!IMPORTANT]
> Codex ne lance pas automatiquement cette skill dans un sous-agent depuis le frontmatter Claude. Si tu es l'agent principal, délègue l'exécution complète au sous-agent `caserne-reader`, puis synthétise uniquement son résultat final.

# inbox

Vue « boîte de réception » du **projet courant** : ce qui bouge côté Linear (issues actives) et côté Slack (canal du projet). Lecture seule - on consulte, on ne modifie rien.

## Étape 0 - Identité du projet (obligatoire)

L'identité du projet est servie au démarrage dans le bloc `<caserne-project>` (injecté par le hook SessionStart depuis `_memory_/ONBOARD.md`). Récupère-y deux valeurs dans le tableau :

| Champ | Ligne du tableau |
|---|---|
| Linear Project ID | `| Linear Project | <uuid> (team EAT) |` |
| Channel Slack ID | `| Slack | #<slug> (<Cxxxx>) |` |

**Garde-fou** : si aucun bloc `<caserne-project>` n'est présent (projet pas encore onboardé, ou onboardé avant la migration vers `_memory_/ONBOARD.md`), arrête-toi et dis-le clairement :
```
Pas d'identité projet (<caserne-project> absent) - inbox indisponible.
Lance /erom-onboarding pour (re)générer _memory_/ONBOARD.md.
```
Le Channel Slack ID, lui, est optionnel : s'il manque, fais la partie Linear et signale juste que le canal Slack n'est pas configuré.

## Étape 1 - Issues Linear du projet

**Toutes** les issues du projet (pas seulement celles de l'agent courant).

```
<MCP Linear>.list_issues({
  project: <PROJET_LINEAR_ID>,
  includeArchived: false,
  limit: 100
})
```

Puis, côté skill :
- **Exclure** les issues terminées : statuts `Done`, `Canceled`, `Duplicate`.
- **Trier** par statut dans cet ordre (du plus avancé au moins avancé) :
  1. Implementation
  2. Specification
  3. Todo
  4. Backlog

  (référentiel des statuts : section `## Linear` de CASERNE.md)

Affiche un tableau :

```
| ID      | Title                          | Status         |
|---------|--------------------------------|----------------|
| EAT-142 | Refacto pipeline ingestion     | Implementation |
| EAT-138 | Spec connecteur OAuth          | Specification  |
| EAT-151 | Bug dédup chunks               | Todo           |
```

Aucune issue active → `Aucune issue active sur ce projet.`

## Étape 2 - Inbox Slack du projet

L'inbox = les messages qui **mentionnent l'agent courant** (`<@Uxxxx>`) et qui ne sont **pas encore traités** (sans réaction ✅ / ☑️). C'est une liste « à traiter », pas l'historique du canal.

Si un Channel Slack ID a été trouvé :

```
<MCP Slack>.slack_get_inbox({
  user_id:    <Slack ID de l'agent courant>,  // fourni par le hook (bloc <caserne-self>)
  channel_id: <CHANNEL_SLACK_ID>,             // restreint au canal du projet
  limit:      50
})
```

`user_id` = l'agent qui exécute la skill. Son Slack ID est servi au démarrage dans le bloc `<caserne-self>` (la ligne de l'agent courant dans la table `## Agents` de CASERNE.md, colonne « Slack ID »). À défaut, lis-le directement dans cette table.

Pas de canal configuré → `Pas de canal Slack configuré pour ce projet.` (on n'omet pas `channel_id` pour scanner tout le workspace : on veut rester cadré sur le projet).

Affiche les messages remontés (auteur, extrait, âge). Aucun → `Inbox Slack vide (rien à traiter).`

## Affichage final

Un bloc unique, Linear puis Slack :

```
=== Inbox <nom du projet> ===

📋 Issues actives (3)
<tableau>

💬 Slack (<n> en attente)
<inbox ou note d'absence>
```

## Contraintes

- **Lecture seule.** Cette skill ne crée, ne modifie et ne ferme rien (ni issue, ni message).
- Ne devine jamais le Projet Linear ID : sans lui, on s'arrête (étape 0).
- Affiche toujours les identifiers `EAT-XXX`.
