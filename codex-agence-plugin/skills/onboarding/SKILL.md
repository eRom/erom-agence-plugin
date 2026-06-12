---
name: erom-onboarding
description: "Bootstrap projet eRom — GitHub repo privé, Linear Project EAT, Slack canal privé, structure locale."
---

> [!IMPORTANT]
> Codex ne lance pas automatiquement cette skill dans un sous-agent depuis le frontmatter Claude. Si tu es l'agent principal, délègue l'exécution complète au sous-agent `caserne-builder`, puis synthétise uniquement son résultat final.

# Onboarding projet — écosystème eRom

Orchestre l'init d'un nouveau projet (peu importe où il vit sur disque — `~/dev/`, `~/Documents/`, n'importe où) avec quatre cibles : **GitHub**, **Linear**, **Slack**, **structure locale**. Conçu pour être idempotent : on lookup d'abord, on ne crée que ce qui manque.

## Pré-requis

- `gh` CLI authentifié sur le compte `eRom` (auth https, droits de création de repo sur l'org)
- Un serveur MCP **Linear** actif et connecté au workspace eRom (team `EAT`)
- Un serveur MCP **Slack** actif et connecté au workspace eRom
- Pour l'étape RAG : un clone local du vault dans `~/.config/gerber-vault` (sinon l'étape se cloue/skip proprement)
- `~/.config/CASERNE.md` doit exister **et être rempli** (IDs d'agence : team Linear, statuts, labels, channel). Sinon l'**étape 0** le bootstrappe depuis le template et rend la main. Les IDs sont injectés au démarrage (hook) ; à défaut `Read ~/.config/CASERNE.md`.

## Portabilité cross-agents

Cette skill est conçue pour vivre dans Codex, Codex et Gemini CLI — chacun a sa propre convention de nommage pour les outils MCP (`mcp__plugin_linear_linear__list_projects` côté Claude, autre chose côté Codex/Gemini). Les appels d'outils sont donc décrits ici sous forme **logique** : `<MCP Linear>.list_projects`, `<MCP Slack>.create_channel`, etc. Charge à chaque agent de traduire vers le nom technique exact disponible dans son contexte. Si un outil logique n'a pas d'équivalent dans l'agent courant, stoppe et signale-le proprement plutôt que de bricoler.

## Mode `--dry-run`

Si l'utilisateur dit "dry-run", "simulation", "sans rien créer", ou "à blanc" : déroule toute la logique de détection (lookups inclus) mais **n'appelle aucune API de création** ni n'écrit de fichier. Affiche à la place le résumé final avec `[DRY-RUN] would create:` devant chaque action qui aurait été exécutée.

## Workflow

### 0. Pré-requis agence : `~/.config/CASERNE.md` (bloquant)

L'onboarding consomme les IDs d'agence (team Linear, statuts, labels, channel Slack) depuis `~/.config/CASERNE.md`. Pré-requis dur : sans lui, aucun lookup possible. Setup **déterministe à la main** - aucune discovery MCP, aucune génération automatique.

```bash
if [ ! -f "$HOME/.config/CASERNE.md" ]; then
  mkdir -p "$HOME/.config"
  cp "<base dir de ce skill>/references/CASERNE_TEMPLATE.md" "$HOME/.config/CASERNE.md"
fi
```

Puis **vérifie qu'il est rempli** : si le fichier vient d'être créé, ou si la team Linear est encore un placeholder (la ligne `- Team :` contient un `<...>`), **arrête-toi** sans rien faire d'autre et affiche :

```
~/.config/CASERNE.md initialisé depuis le template (ou incomplet).
Remplis-le avec les IDs de ton agence (team Linear, statuts, labels, projet Handoffs, channel Slack, comptes agents), puis relance /erom-onboarding.
```

L'agent est forké (pas de dialogue interactif) : il rend la main, l'utilisateur remplit le fichier, puis relance la skill (idempotente). Si `~/.config/CASERNE.md` existe **et** que la team Linear est renseignée → continue le workflow.

### 1. Déterminer le slug du projet

**Source par défaut : `basename "$(pwd)"`.** Romain bosse depuis n'importe quel dossier (`~/dev/cruchot-cli/`, `~/Documents/Nouveau Projet/`, `~/tmp/xyz/`, etc.) — le slug se déduit toujours du nom du dossier courant, jamais du chemin parent.

**Ordre de priorité :**

1. **L'utilisateur a fourni un nom explicite** dans son message (ex: "onboard `mon-projet`", "init `barda-cli`") → applique la normalisation kebab-case ci-dessous et utilise-le.
2. **Sinon** → prends `basename "$(pwd)"` et applique la normalisation. Le dossier ne change pas de nom entre deux runs, donc cette dérivation est stable et sert d'ancre d'idempotence implicite.

#### Normalisation kebab-case

Applique dans cet ordre :
1. Décompose les accents (NFD) puis retire les diacritiques (`é`/`è`/`ê` → `e`, `ç` → `c`, `à` → `a`, `ô` → `o`, etc.).
2. Passe tout en lowercase.
3. Remplace `_`, espaces, et tout caractère non-`[a-z0-9-]` par `-`.
4. Coalesce les `-` consécutifs en un seul, trim les `-` en début/fin.

**Exemples :**

| Basename brut | Slug normalisé |
|---------------|----------------|
| `cruchot-cli` | `cruchot-cli` (inchangé, pas de confirmation nécessaire) |
| `Nouveau Projet` | `nouveau-projet` (pas de confirmation nécessaire) |
| `Mon Idée_v2` | `mon-idee-v2` (pas de confirmation nécessaire) |
| `API__keys  manager` | `api-keys-manager` (pas de confirmation nécessaire) |
| `RéacteurNucléaire` | `reacteur-nucleaire` (pas de confirmation nécessaire) |

### 1bis. Ancre d'idempotence : `_memory_/ONBOARD.md`

Avant de lancer les lookups distants, **regarde si `_memory_/ONBOARD.md` existe dans le repo courant** :
- **Oui** → parse le tableau pour récupérer les IDs déjà connus (Linear project ID, Slack channel ID). Tu peux toujours faire les lookups distants en parallèle pour confirmer qu'ils sont encore valides (un canal Slack peut avoir été archivé, un projet Linear renommé), mais ces IDs guident la phase de création : si tout est cohérent, aucune création.
- **Non, mais un bloc `## ... Onboarding (eRom)` traîne dans `AGENTS.md`** (projet onboardé avant la migration) → c'est un cas de **migration** : récupère les IDs de ce bloc, ils serviront à écrire `_memory_/ONBOARD.md` en étape 4 (le bloc legacy sera retiré de `AGENTS.md` à ce moment-là).
- **Ni l'un ni l'autre** → on part en mode discovery pur (lookups par nom uniquement).

C'est `_memory_/ONBOARD.md` qui sert d'ancre d'idempotence durable (fichier dédié, neutre, agnostique), pas `AGENTS.md`.

### 2. Phase de découverte (lookup en parallèle)

Lance ces lookups en parallèle (un seul message avec plusieurs tool calls) pour réduire la latence :

| Cible | Appel | Critère "existe" |
|-------|-------|------------------|
| **GitHub** | `gh repo view eRom/<slug> --json url,visibility,isPrivate 2>/dev/null` | exit 0 |
| **Linear** | `<MCP Linear>.list_projects` filtré sur la team d'agence (clé lue dans `## Linear` de CASERNE.md) | match exact (case-insensitive) sur `name` = `<slug>` |
| **Slack** | `<MCP Slack>.list_channels` (ou `search_channels` si l'outil existe) avec query `<slug>` | match exact sur `name` |
| **Local** | `test -f _memory_/ONBOARD.md` | présence du fichier d'identité projet |

Garde les IDs trouvés dans un état mental clair avant la phase de création.

### 3. Phase de création (parallèle quand possible)

Pour chaque cible **manquante**, exécute :

#### GitHub (si absent)
```bash
gh repo create eRom/<slug> --private --description "<slug>" --confirm
```
Capture l'URL HTTPS. Le repo est créé vide — pas de `--clone` ici (le cwd est probablement déjà le dossier du projet).

Si le dossier n'est pas encore un repo git :
```bash
git init && git remote add origin git@github.com:eRom/<slug>.git
```

#### Linear (si absent)
Appelle `<MCP Linear>.save_project` (ou `create_project` selon l'outil exposé) avec :
- `name`: `<slug>`
- `team`: la team d'agence (clé/ID lus dans `## Linear` de CASERNE.md)
- `state`: `backlog`
- `description`: une ligne contextuelle si l'utilisateur l'a fournie

Capture l'`id` retourné.

#### Slack (si absent)

**Chemin principal** — appelle `<MCP Slack>.slack_setup_project_channel` (un seul appel qui crée + invite + poste le message d'accueil) avec :
- `name`: `<slug>`
- `welcome_message`: `"Welcome to our new project ! 😎"`

Capture le `channel_id` retourné (nécessaire pour `_memory_/ONBOARD.md`).

**Fallback** — si l'outil `slack_setup_project_channel` n'existe pas dans l'agent courant **ou** s'il a échoué, déroule en deux appels :
1. `<MCP Slack>.create_channel` avec `name: <slug>`, `is_private: true` → capture `channel_id`
2. `<MCP Slack>.invite_to_channel` avec `channel_id` + liste des Slack IDs


#### Structure locale (idempotent)
```bash
mkdir -p _memory_
```


#### RAG (enregistrement dans le vault)

Enregistre le projet dans le **vault cortex** pour qu'il soit cloné (cron) puis indexé (FileSearchStore Gemini). Le vault est un repo Git dont une copie locale vit dans `~/.config/gerber-vault` ; on opère directement sur ce clone (édition + commit + push), pas via l'API GitHub.

**Constantes :**
- Clone local du vault : `~/.config/gerber-vault`
- Registre : `sources.yml` (sous la clé `sources:`)
- Repo enregistré : **`eRom/<slug>`**
- Paths par défaut indexés :
  ```yaml
  - README.md
  - docs/
  - _memory_/
  ```

**Étapes :**

1. **Vérifier le clone.** Si `~/.config/gerber-vault` n'existe pas : tente `git clone https://github.com/eRom/gerber-vault.git ~/.config/gerber-vault`. Si le clone échoue (pas d'accès, offline), **n'échoue pas l'onboarding entier** : note `rag: SKIPPED (vault local indisponible)` et passe à la suite.

2. **Synchroniser avant d'éditer** (le clone local est souvent en retard sur le distant) :
   ```bash
   git -C ~/.config/gerber-vault pull --ff-only
   ```
   Si le pull échoue (divergence, conflit), stoppe l'étape RAG avec un message clair plutôt que de risquer un push refusé. Les autres cibles restent acquises.

3. **Idempotence** — cherche une entrée existante :
   ```bash
   grep -qE "^[[:space:]]*-[[:space:]]*repo:[[:space:]]*eRom/<slug>[[:space:]]*$" ~/.config/gerber-vault/sources.yml
   ```
   Si trouvée → aucune écriture, résumé `rag: OK (reused)`.

4. **Append du bloc** en fin de `sources.yml` (indentation 2 espaces, alignée sur les entrées existantes), avec la date du jour :
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
   Résumé : `rag: OK (created)`.

**Mode `--dry-run`** : déroule pull + idempotence (lecture seule), mais n'écris pas dans `sources.yml` et ne commit/push pas. Affiche `[DRY-RUN] would register eRom/<slug> in vault sources.yml`.


### 4. Écriture de `_memory_/ONBOARD.md`

Les IDs par-projet vivent dans un fichier dédié, neutre et agnostique (lu par tous les agents via le hook SessionStart, qui l'injecte sous la balise `<caserne-project>`). Le dossier `_memory_/` a déjà été créé à l'étape 3.

**Écris `_memory_/ONBOARD.md`** avec ce contenu, en remplaçant les `<placeholders>` par les valeurs fraîches :

```markdown
## <slug> - Onboarding (eRom)

| Cible | Référence |
|-------|-----------|
| Linear Project | `<linear_project_id>` (team EAT) |
| Slack | `#<slug>` (`<slack_channel_id>`) |
```

Le fichier **est** le bloc : pas de merge, pas de sections custom à préserver. Idempotence triviale → on (ré)écrit le fichier avec les valeurs courantes (si elles n'ont pas bougé, le contenu est identique).

**Migration depuis `AGENTS.md` (legacy).** Si `_memory_/ONBOARD.md` n'existait pas mais qu'un bloc `## ... Onboarding (eRom)` traîne dans `AGENTS.md` (repéré en étape 1bis) :
1. Écris `_memory_/ONBOARD.md` avec les valeurs (fraîches si lookups OK, sinon celles du bloc legacy).
2. **Retire** la section `## ... Onboarding (eRom)` de `AGENTS.md` (uniquement cette section ; ne touche à AUCUNE autre section custom que Romain aurait ajoutée).

### 5. Résumé final

Affiche un tableau récapitulatif dans ce format exact (cocher `OK` quand fait/existant, `SKIP` uniquement si une cible était indisponible, et indiquer `(reused)` ou `(created)` pour les actions effectives) :

```
Onboarding <slug> :

github     : OK (created)   → https://github.com/eRom/<slug>
linear     : OK (reused)    → Project <linear_project_id>
slack      : OK (created)   → #<slug> (<slack_channel_id>)
structure  : OK             → _memory_/
contexte   : OK (created)   → _memory_/ONBOARD.md
rag        : OK (created)   → eRom/<slug> ajouté à gerber-vault/sources.yml
```

En mode `--dry-run`, préfixe chaque ligne par `[DRY-RUN]` et précise `would create` / `would reuse` / `would merge`.

## Comportement attendu sur ré-exécution

Si Romain relance la skill sur un projet déjà onboardé :
- Tous les lookups doivent trouver les ressources existantes.
- Aucune création n'est tentée.
- `_memory_/ONBOARD.md` est (ré)écrit avec les valeurs courantes (contenu identique si rien n'a bougé). Un éventuel bloc legacy encore présent dans `AGENTS.md` est retiré (migration one-shot).
- Résumé final affiche `OK (reused)` partout, sans bruit.

C'est le test de non-régression à garder en tête.

## Gestion des erreurs

- **gh non authentifié** → demande à Romain de lancer `gh auth login` et stoppe net. Ne tente pas de fallback.
- **MCP linear/slack indisponible** → indique précisément quelle MCP est down, propose à Romain de relancer Codex avec la MCP active, mais **continue les autres cibles** (l'idempotence repassera dessus à la prochaine exec).
- **Collision de nom** (ex: repo GitHub existe sur un autre owner) → arrête et demande clarification, ne crée pas en silence sous un nom modifié.

## Pourquoi cette skill existe

Romain crée régulièrement de nouveaux projets eRom et le setup à la main (4 plateformes + fichiers locaux) est répétitif et facile à oublier. L'idempotence permet de relancer sans peur si une étape a foiré la première fois, et le fichier dédié `_memory_/ONBOARD.md` (neutre, agnostique) découple l'identité projet du fichier mémoire spécifique à chaque agent. Le tableau récap final est la signature visible que tout est aligné.
