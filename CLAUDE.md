# Projet

Ce projet est un plugin (nom : caserne) pour les agents IA de codage, distribué en open source.

**Développement : monorepo.** Cette racine (`erom-agence-plugin/`) est le monorepo de dev :
plugin maître + variantes générées + outillage de génération. Le plugin **Claude Code**
(`claude-agence-plugin/`) est le **maître** ; les variantes **Codex** et **Antigravity/Gemini**
sont générées depuis lui par un transpileur déterministe.

**Distribution : un seul repo public.** Tout vit dans `erom-agence-plugin`. Trois façons d'installer :
- **git-subdir** (marketplace `erom-marketplace`) : Claude et Codex - l'agent clone le repo et
  pointe le sous-dossier de sa variante.
- **Install directe** : Antigravity/Gemini s'installe directement depuis
  `eRom/erom-agence-plugin/gemini-agence-plugin` (Google n'a pas encore documenté de marketplace
  pour Antigravity).
- **Release zip** (`gh release`, non-draft) : contextes sans git (politique sécurité, air-gap).
  Les zips des variantes sont attachés en assets de release, jamais commités.

| Variante           | Dossier (monorepo)      | Rôle   | Installation                |
| ------------------ | ----------------------- | ------ | --------------------------- |
| Claude Code        | `claude-agence-plugin/` | maître | git-subdir (marketplace)    |
| Codex              | `codex-agence-plugin/`  | généré | git-subdir (marketplace)    |
| Antigravity/Gemini | `gemini-agence-plugin/` | généré | directe (repo/sous-dossier) |

Repos : code → https://github.com/eRom/erom-agence-plugin · marketplace → https://github.com/eRom/erom-marketplace

# Rules

- Cette racine EST le monorepo de dev : versionnée (git) et publiée vers `erom-agence-plugin`.
  L'historique de dev complet reste local (branche `dev-archive`) ; le repo public part d'un
  commit initial propre, sans données personnelles.
- **Le maître est la seule chose éditée à la main.** `codex-agence-plugin/` et
  `gemini-agence-plugin/` sont **générés** : jamais d'édition directe. Tout part de
  `claude-agence-plugin/`, puis régénération via l'outillage (`scripts/gemini-generator.ts`).
- **Un seul numéro de version**, partagé par les 3 variantes (plugin.json) + les 2 entrées
  marketplace : toujours ISO. La version Claude (maître) fait foi.
- Les `*.zip` ne sont **jamais commités** (`dist/` est gitignore) : ce sont des assets de release.
- **Aucune donnée propre à l'installation en dur** dans le code distribué (IDs Slack/Linear,
  emails, chemins `/Users/...`) : elles vivent dans la config locale (`~/.config/CASERNE.md`),
  résolues au runtime.
- Pas de « Onboarding » au niveau du dossier racine.
