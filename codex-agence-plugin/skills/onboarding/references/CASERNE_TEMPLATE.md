<!-- TEMPLATE caserne - copié vers ~/.config/caserne/CASERNE.md au premier onboarding.
     Remplis chaque placeholder <...> avec les IDs réels de ton agence, puis relance /erom-onboarding.
     Les noms par défaut (statuts, labels, projet, canal) sont pré-remplis : ajuste-les si besoin.
     Référentiel d'IDs stables de l'agence, injecté en contexte au démarrage (hook SessionStart).
     Source de vérité unique. PAS de jetons d'authentification (ils restent en variables d'env),
     PAS d'IDs par-projet (= _memory_/ONBOARD.md de chaque projet). -->

# CASERNE - Contexte agence <WORKSPACE_NAME>

## Agents

La 1re colonne (nom) doit matcher la clé d'agent détectée par le hook : `claude`, `codex`, `gemini`, `deepseek` (insensible à la casse). La ligne owner sert à t'adresser, elle n'est jamais "self".

| Agent | Slack ID | Linear ID | Email |
| --- | --- | --- | --- |
| Claude | <SLACK_ID> | <LINEAR_ID> | <EMAIL> |
| Codex | <SLACK_ID> | <LINEAR_ID> | <EMAIL> |
| Gemini | <SLACK_ID> | <LINEAR_ID> | <EMAIL> |
| Deepseek | <SLACK_ID> | <LINEAR_ID> | <EMAIL> |
| <OWNER_NAME> | <SLACK_ID> | <LINEAR_ID> | <EMAIL> |

## Linear - workspace <WORKSPACE_NAME> (<WORKSPACE_URL>)

- Team : eRom-Agents - key `EAT` - `<TEAM_LINEAR_ID>`
- Workflow Issues : Backlog -> Todo -> Specification -> Implementation -> Done
- Workflow Projects : Backlog -> In Progress -> Completed

| Statut | ID | Type |
| --- | --- | --- |
| Backlog | <STATE_ID> | backlog |
| Todo | <STATE_ID> | unstarted |
| Specification | <STATE_ID> | started |
| Implementation | <STATE_ID> | started |
| Done | <STATE_ID> | completed |
| Canceled | <STATE_ID> | canceled |
| Duplicate | <STATE_ID> | duplicate |

| Label | ID |
| --- | --- |
| PLAN OK | <LABEL_ID> |
| SPEC OK | <LABEL_ID> |
| handoff | <LABEL_ID> |
| doc | <LABEL_ID> |
| feature | <LABEL_ID> |
| bug | <LABEL_ID> |

| Projet infra | ID | Rôle |
| --- | --- | --- |
| Handoffs | <PROJECT_ID> | Transferts de contexte cross-agents |

## Slack

| Canal | Slack ID | Description |
| --- | --- | --- |
| #caserne | <CHANNEL_ID> | Cross-projet global |
