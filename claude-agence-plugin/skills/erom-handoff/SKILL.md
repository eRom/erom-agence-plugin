---
name: erom-handoff
description: "Transfère le contexte de la session courante dans une issue Linear (workspace eRom, projet Handoffs) pour le reprendre ailleurs. Déclenche dès que l'utilisateur veut créer, lister, reprendre ou libérer un transfert, ou exprime l'intention de basculer ailleurs : 'commence un transfert', 'passe la main', 'save le contexte', 'liste mes transferts', 'reprends EAT-X', 'reprends là où j'en étais ailleurs', 'libère le transfert'."
user-invocable: true
---

# erom-handoff

Un handoff = **une issue Linear** dans le projet `Handoffs`, qui capture juste ce qu'il faut pour qu'une autre session - sur n'importe quel agent, n'importe quel device - reprenne le travail sans repartir de zéro.

Ce n'est pas un dump de transcript. C'est un `/teleport` curé : décisions prises, prochaine action, état du chantier. L'essentiel, rien que l'essentiel.

## Container (résolu depuis CASERNE.md)

Les IDs d'agence vivent dans `CASERNE.md`, le référentiel injecté au démarrage de session (à défaut : `Read ~/.config/CASERNE.md`). **Au lancement, résous une fois ces rôles** depuis la section `## Linear` de CASERNE.md, puis réfère-les par nom dans les appels ci-dessous :

| Rôle | Où le lire dans CASERNE.md |
|---|---|
| team d'agence | ligne `team` de `## Linear` (clé + ID) |
| projet Handoffs | table Projets, ligne « Handoffs » (colonne ID) |
| label handoff | table Labels, ligne « handoff » (colonne ID) |
| state Todo (initial) | table Statuts, ligne « Todo » (colonne ID) |
| state Done (final) | table Statuts, ligne « Done » (colonne ID) |

Toutes les opérations passent par le connecteur Linear, noté `<MCP Linear>.<tool>` (forme logique pour rester portable Claude/Codex/Gemini). Pas de MCP Linear local, pas de plugin.

## Résolution de l'intention

| Intention | Action | Tool |
|---|---|---|
| « commence un transfert », « save ça », « passe la main » | Créer | `save_issue` |
| « liste mes transferts », « mes handoffs » | Lister | `list_issues` |
| « prends/reprends/charge le transfert X » | Reprendre | `get_issue` (ou `list_issues` par titre) |
| « libère/done le transfert X » | Libérer | `save_issue` (state → Done) |

Ambiguïté → question fermée, ne devine pas.

## Quoi mettre dans un handoff

Le doc est en markdown **agnostique** (il sera peut-être lu par Codex ou Gemini, pas forcément toi). Pas de jargon Claude, pas de chemins propres à un seul environnement sans les expliquer.

Vise « une session fraîche reprend sans poser de question bête ». Pas de template rigide - adapte au contexte. Selon les cas, sont utiles :
- ce qu'on vient de décider (et ce qu'on a écarté, si ça évite de re-débattre)
- **la prochaine action concrète** (le plus important)
- fichiers touchés + état git (branche, commité ou non, poussé ou non)
- blockers et questions ouvertes
- liens utiles (issue parente, PR, doc)

Ce qu'on ne met **pas** : le transcript, les détours, le contexte que la prochaine session retrouvera seule en lisant le code.

## Créer

1. Titre court (3-6 mots), sans ponctuation finale.
2. Rédige le contenu selon « Quoi mettre dans un handoff » ci-dessus.
3. Confirme le draft avant d'écrire :
   ```
   --- Transfert ---
   Titre : <title>

   <content>
   -----------------
   Créer ? (o/n)
   ```
4. Sur `o` :
   ```
   <MCP Linear>.save_issue({
     team:    <ID team d'agence>,    // résolu depuis CASERNE.md
     project: <ID projet Handoffs>,
     title:   <title>,
     description: <content>,
     labels:  [<ID label handoff>],
     state:   <ID state Todo>
   })
   ```
5. Confirme : `Transfert créé : "<title>" → EAT-XXX` + URL.

## Lister

```
<MCP Linear>.list_issues({
  project: <ID projet Handoffs>,
  state:   <ID state Todo>,
  orderBy: "createdAt"
})
```

Par défaut `state: Todo`. « tous » → omettre `state`. « les finis » → state Done.

Affichage (toujours montrer l'identifier `EAT-XXX`) :
```
=== Transferts (3 Todo) ===

1. [EAT-170] Brainstorm dashboard v3      2h ago
2. [EAT-165] Spec OAuth connector         hier
3. [EAT-158] Bug E5 chunking              3j ago
```

Vide : `=== Transferts (0 Todo) ===\nRien en attente.`

## Reprendre

- Identifier fourni : `<MCP Linear>.get_issue({ id: "EAT-XXX" })`.
- Sinon, recherche par titre : `<MCP Linear>.list_issues({ project: <ID projet Handoffs>, query: <titre>, limit: 5 })`.
  - Match unique → l'utiliser.
  - Plusieurs → afficher et demander lequel.

Affichage :
```
=== [EAT-XXX] <title> ===
<description>

→ Prochaine action : <reformulation concise en ≤2 phrases>
```

Ne ferme **pas** automatiquement. Si l'utilisateur dit « c'est bon, je reprends », propose de libérer.

## Libérer

```
<MCP Linear>.save_issue({
  id:    "EAT-XXX",
  state: <ID state Done>
})
```

Confirme : `Transfert "<title>" libéré (EAT-XXX → Done).`

## Contraintes

- N'ajoute **jamais** de champ au-delà de title/description/labels/state (pas de priority, milestone, cycle, parentId, assignee). Un handoff est volontairement minimal.
- Ne dévie **jamais** du container (team/projet/label résolus depuis CASERNE.md ci-dessus).
- Ne supprime **jamais** un transfert (uniquement `Todo → Done`, l'historique reste).
- Confirme toujours avant création.
- Affiche toujours `EAT-XXX` dans les confirmations et les listings.
