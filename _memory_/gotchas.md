# Gotchas & pièges — erom-agence-plugin

_Mise à jour : 2026-07-08_

## `docs/` est gitignoré à la racine — pas de commit possible, et c'est voulu
`.gitignore` contient `/docs/` : un `git add docs/...` échoue avec « paths are ignored ». Contrairement au repo voisin `erom-agence-control-plane` où `docs/specs`/`docs/plans` **sont** trackés, ici les specs et plans de brainstorm restent **strictement locaux** (repo public sans traces de dev interne). Vérifié en creusant : les specs précédentes (juin 2026) ne sont pas non plus dans `git ls-files docs/`. Ne pas essayer de forcer (`-f`) sans en parler à Romain — c'est un choix délibéré de repo, pas un oubli.

## Ne jamais éditer `codex-agence-plugin/` ou `gemini-agence-plugin/` directement
Ce sont des sorties de transpileur (`scripts/codex-generator.ts`, `scripts/gemini-generator.ts`), régénérées depuis `claude-agence-plugin/` (le maître). Un commit de skill touche **uniquement** le maître ; la régénération + bump de version ISO (3 variantes + 2 entrées marketplace) est un rituel de release **séparé**, pas à faire dans le même commit qu'un ajout/retouche de skill (observé sur le commit `agence-network` du 2026-07-07 et `agence-orchestrate` du 2026-07-08 : SKILL.md seul, rien d'autre).

## Repo public : toute citation CLI dans un skill doit être vérifiée contre la source réelle, pas la mémoire
Un skill qui cite un message d'erreur, un flag ou un exit code du CLI `caserne` (repo voisin) doit être grep-vérifié contre les sources réelles du control-plane **au moment de l'écriture**, pas recopié de mémoire ou d'un ancien spec — le CLI évolue de son côté (ex. le siège `boss` mergé le 2026-07-07 a rendu périmée une ligne d'erreur `CASERNE_ALIAS absent` qu'`agence-network` citait encore). Sans cette vérif, un skill peut enseigner un chemin d'erreur mort.

## Un dispatch nommé explicitement ne contourne pas une exclusion de capacité
Piège de conception découvert en revue finale (`agence-orchestrate`, 2026-07-08) : la règle « salarié nommé explicitement → même protocole, table de routage court-circuitée » peut sembler impliquer qu'un signal hors-v1 (ex. génération d'images) passerait quand même si l'utilisateur nomme le salarié directement (« délègue à agy : génère un logo »). Une exclusion de capacité non vérifiée doit être **répétée explicitement** à l'endroit qui documente le contournement-par-nom, pas seulement dans la table de routage — sinon la doctrine se contredit elle-même à la lecture littérale. Un seul angle de lecture (juste la table) ne suffit pas à une revue de skill de dispatch ; il faut relire le frontmatter (déclencheurs) contre les sections de contrainte.
