# Patterns & conventions — erom-agence-plugin

_Mise à jour : 2026-07-08_

## Structure d'un skill

- Frontmatter YAML : `name`, `description` (déclencheurs **explicites** listés en toutes lettres — verbes/phrases qui doivent faire lever le skill, et souvent un contre-déclencheur écrit noir sur blanc pour éviter le sur-déclenchement), `user-invocable: true`.
- Corps en prose française, calqué sur `agence-network` : intro (à quoi sert le skill, ce qui le distingue du skill voisin), principes non négociables numérotés, table de référence rapide, sections détaillées par commande/étape, tableau d'erreurs fréquentes, cycle typique, section finale « Ce que ce skill ne couvre pas » (renvoie vers le skill compétent).
- **Skills complémentaires qui se renvoient l'un l'autre symétriquement** (ex. `agence-network` ↔ `agence-orchestrate` : le salarié dans son pane / le chef hors pane) : chacun a une puce « ne couvre pas » pointant vers l'autre.

## Philosophie transverse

- **La commande (CLI/MCP) est la source de vérité, le skill enseigne le quand/pourquoi.** Un skill ne réexplique jamais les flags en détail — `caserne` sans argument fait foi. Ajouter/renommer une commande ne devrait toucher qu'une ligne de skill, pas sa structure.
- **Toute commande/flag/exit-code/message cité dans un skill doit exister réellement dans le CLI mergé.** Se vérifie par grep direct contre les sources du repo voisin `erom-agence-control-plane` avant d'écrire ou de committer (cf. gotchas.md, pattern "External Conventions Require a Captured Sample").

## Édition et release

- **Maître seul édité à la main** (`claude-agence-plugin/`). Les variantes générées ne sont jamais touchées dans un commit de skill — la régénération + bump de version est un rituel de release séparé, distinct du chantier d'écriture du skill.
- **Repo public** : jamais de chemin `/Users/...`, de nom de subagent personnel, d'ID Slack/Linear/email en dur dans un fichier distribué. Un skill parlant de fallback ou d'outillage local le nomme **génériquement** (« les moyens de recherche locaux de la session hôte »), jamais par le nom d'un subagent d'installation privée.

## Git

- Commits **conventional commits en français** : `feat(skills): …`, `fix(skills): …`, `docs(spec): …`. Corps explicatif (contexte, décisions).
- Développement sur branche dédiée, mergée en **fast-forward** sur `main` une fois la revue finale "Ready to merge". Un commit de skill ne stage que les fichiers du skill concerné (un fichier dirty pré-existant sans rapport reste intouché).

## Process (hérité de superpowers, observé sur ce chantier)

- Brainstorm → spec (`docs/specs/`, local) → plan (`docs/plans/`, local) → exécution en subagent-driven-development (implémenteur + revue par tâche + revue finale de branche).
- Pour un chantier de prose (skills markdown, pas de code), la revue finale n'a pas besoin d'opus systématique : sonnet suffit si le diff est petit et sans logique — juger au cas par cas, contrairement à la règle "opus always" des chantiers de code.
