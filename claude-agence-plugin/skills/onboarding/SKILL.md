---
name: onboarding
description: "Bootstrap projet eRom — repo GitHub privé, cœur agence (projet Linear + canal Slack + ONBOARD.md) via le tool MCP setup_project, enregistrement RAG."
user-invocable: true
disable-model-invocation: true
context: fork
agent: caserne-builder
---

# Onboarding projet — écosystème eRom

Init d'un nouveau projet (peu importe où il vit sur disque). Le **cœur agence** — projet Linear + canal Slack privé + invitations + message d'accueil + `_memory_/ONBOARD.md` — est délégué à un seul tool MCP idempotent : **`setup_project`** (côté Caserne). Il ne reste que deux cibles à orchestrer ici : **GitHub** (repo privé) et **RAG** (vault cortex).

Le référentiel d'agence (team Linear, statuts, labels, projets, canaux, annuaire) vit dans `~/.config/caserne/employees.yml` et est **résolu côté serveur**.

## Pré-requis

- `gh` CLI authentifié sur le compte `eRom` (droits de création de repo sur l'org).
- MCP **Caserne** connecté (`CASERNE_AGENT_ID` défini dans l'env). Sans lui, `setup_project` échoue : stoppe proprement et signale-le, ne bricole pas de fallback Linear/Slack.
- Pour l'étape RAG : un clone local du vault dans `~/.config/gerber-vault` (sinon l'étape se skippe proprement, sans faire échouer le reste).

## Portabilité cross-agents

Cette skill vit dans Claude Code, Codex et Gemini CLI. Les tools MCP sont désignés sous forme **logique** : `<MCP Caserne>.setup_project`. Côté Claude, le nom technique est `mcp__caserne__setup_project` ; charge à chaque agent de traduire vers l'outil exact de son contexte. Si l'outil n'existe pas dans l'agent courant, stoppe et signale-le plutôt que de réimplémenter l'orchestration à la main.

## Slug du projet

`setup_project` dérive le slug du `basename` du répertoire courant (NFD → suppression des diacritiques → lowercase → kebab-case), et c'est aussi le nom du repo GitHub. Pour garantir que **GitHub et Linear partagent exactement le même slug**, calcule-le une fois ici et passe-le en `name` à `setup_project`.

**Ordre de priorité :**
1. L'utilisateur a fourni un nom explicite ("onboard `barda-cli`") → normalise-le en kebab-case.
2. Sinon → `basename "$(pwd)"` normalisé.

Normalisation (même règle que le serveur) : NFD + retrait des accents (`é`→`e`, `ç`→`c`…), lowercase, tout caractère hors `[a-z0-9-]` → `-`, coalesce les `-`, trim. Aucune confirmation nécessaire (`Nouveau Projet` → `nouveau-projet`, `Mon Idée_v2` → `mon-idee-v2`).

## Workflow

### 1. GitHub (si absent)

Lookup :
```bash
gh repo view eRom/<slug> --json url,visibility,isPrivate 2>/dev/null
```

Absent (exit ≠ 0) → crée :
```bash
gh repo create eRom/<slug> --private --description "<slug>" --confirm
```
Repo créé vide, pas de `--clone` (le cwd est déjà le dossier du projet). Capture l'URL HTTPS.

Si le dossier n'est pas encore un repo git :
```bash
git init && git remote add origin git@github.com:eRom/<slug>.git
```

### 2. Cœur agence — `setup_project`

Un seul appel gère projet Linear, canal Slack privé, invitations de l'annuaire, message d'accueil et écriture de `_memory_/ONBOARD.md`. Il est idempotent : il ne crée que le manquant.

```
<MCP Caserne>.setup_project({
  name: "<slug>",            // même slug que le repo GitHub
  description: "<contexte>"  // optionnel, une ligne si l'utilisateur l'a fournie
})
```

Retour à capturer pour le récap :
```
{ slug, linear: "created"|"reused", slack: "created"|"reused", invited, onboard: "written"|"kept" }
```

Rien d'autre à faire pour Linear/Slack : pas de lookup préalable, pas de création manuelle, pas d'invitation à la main, pas d'écriture d'`ONBOARD.md`. Si l'appel échoue (MCP down, token invalide), signale précisément l'erreur remontée et n'invente pas de contournement.

### 3. RAG (enregistrement dans le vault)

Enregistre le projet dans le **vault cortex** pour qu'il soit cloné (cron) puis indexé (FileSearchStore Gemini). Le vault est un repo Git dont une copie locale vit dans `~/.config/gerber-vault` ; on opère directement sur ce clone (édition + commit + push), pas via l'API GitHub.

**Constantes :**
- Clone local du vault : `~/.config/gerber-vault`
- Registre : `sources.yml` (sous la clé `sources:`)
- Repo enregistré : **`eRom/<slug>`**
- Paths par défaut indexés : `README.md`, `docs/`, `_memory_/`

**Étapes :**

1. **Vérifier le clone.** Si `~/.config/gerber-vault` n'existe pas : tente `git clone https://github.com/eRom/gerber-vault.git ~/.config/gerber-vault`. Si le clone échoue (pas d'accès, offline), **n'échoue pas l'onboarding entier** : note `rag: SKIPPED (vault local indisponible)` et passe à la suite.

2. **Synchroniser avant d'éditer** (le clone local est souvent en retard) :
   ```bash
   git -C ~/.config/gerber-vault pull --ff-only
   ```
   Si le pull échoue (divergence, conflit), stoppe l'étape RAG avec un message clair plutôt que de risquer un push refusé. Les autres cibles restent acquises.

3. **Idempotence** — cherche une entrée existante :
   ```bash
   grep -qE "^[[:space:]]*-[[:space:]]*repo:[[:space:]]*eRom/<slug>[[:space:]]*$" ~/.config/gerber-vault/sources.yml
   ```
   Si trouvée → aucune écriture, `rag: OK (reused)`.

4. **Append du bloc** en fin de `sources.yml` (indentation 2 espaces, alignée sur l'existant), avec la date du jour :
   ```yaml
     - repo: eRom/<slug>
       paths:
         - README.md
         - docs/
         - _memory_/
       added: <YYYY-MM-DD>
   ```

5. **Commit + push** — n'ajoute **que** `sources.yml` (le clone contient du bruit Obsidian non commité, ne jamais faire `git add .`) :
   ```bash
   git -C ~/.config/gerber-vault add sources.yml
   git -C ~/.config/gerber-vault commit -m "vault: onboard eRom/<slug>

   Enregistre <slug> dans le registre des satellites RAG.
   Paths indexés : README.md, docs/, _memory_/.
   Ajouté via la skill erom-onboarding."
   git -C ~/.config/gerber-vault push
   ```
   `rag: OK (created)`.

### 4. Résumé final

Affiche un tableau récapitulatif dans ce format (`(reused)`/`(created)` d'après les valeurs retournées par `setup_project` ; `SKIP` seulement si une cible était indisponible) :

```
Onboarding <slug> :

github    : OK (created)   → https://github.com/eRom/<slug>
linear    : OK (reused)    → projet <slug> (team EAT)
slack     : OK (created)   → #<slug> (invités : <n>)
onboard   : OK (written)   → _memory_/ONBOARD.md
rag-docs  : OK (created)   → eRom/<slug> ajouté à gerber-vault
```

Les lignes `linear`, `slack` et `onboard` reprennent directement le retour de `setup_project` (`linear`, `slack`, `invited`, `onboard`).

## Comportement attendu sur ré-exécution

Relancer la skill sur un projet déjà onboardé est sûr :
- GitHub : le lookup trouve le repo, aucune création.
- `setup_project` : tout revient `reused`/`kept`, aucun second message d'accueil.
- RAG : l'entrée `sources.yml` existe déjà → `reused`.

Le récap affiche `reused`/`kept` partout, sans bruit. C'est le test de non-régression.

## Gestion des erreurs

- **gh non authentifié** → demande `gh auth login` et stoppe net, pas de fallback.
- **MCP Caserne indisponible** → `setup_project` échoue : indique-le clairement, propose de relancer avec le MCP actif. GitHub et RAG peuvent avoir été faits ; l'idempotence repassera dessus au prochain run.
- **Collision de nom** (repo GitHub existe sur un autre owner) → arrête et demande clarification, ne crée pas en silence sous un nom modifié.

## Pourquoi cette skill existe

Créer un projet eRom câble plusieurs plateformes ; le faire à la main est répétitif et facile à oublier. Depuis le control plane Caserne, tout le cœur agence est encapsulé dans le tool idempotent `setup_project` (référentiel résolu côté serveur via `employees.yml`), et la skill n'orchestre plus que ce qui vit hors de Caserne : le repo GitHub et l'indexation RAG. L'idempotence permet de relancer sans peur, et le récap final est la signature visible que tout est aligné.
