# Projet 

Ce projet est un plugin (nom : caserne) pour les agents IA, distribué en open source.

**Développement : monorepo.** Cette racine (`erom-agence-plugin/`) est le monorepo de dev : plugin maître + variantes générées + outillage de génération. Le plugin **Claude Code** (`claude-agence-plugin/`) est maître ; les variantes Antigravity/Gemini et Codex sont générées automatiquement depuis lui (transpileur déterministe - cf. `migratation-claude-to-antigravity.md`).

**Distribution : un mirror par agent.** Chaque variante est publiée vers son repo GitHub dédié (les utilisateurs installent depuis là ; Gemini exige un `plugin.json` à la racine du repo, d'où un repo par variante).

| Plugin             | Dossier (monorepo)         | Rôle   | Mirror de distribution                             |
| ------------------ | -------------------------- | ------ | -------------------------------------------------- |
| Claude Code        | claude-agence-plugin/      | maître | https://github.com/eRom/caserne-claude-plugin      |
| Antigravity/Gemini | antigravity-agence-plugin/ | généré | https://github.com/eRom/caserne-antigravity-plugin |
| Codex              | codex-agence-plugin/       | généré | https://github.com/eRom/codex-agence-plugin        |

# Rules
- Cette racine EST le monorepo de dev : elle est versionnée (git).
- On commit dans le monorepo ; les mirrors de distribution sont alimentés par l'outillage de génération (publication automatique), jamais édités à la main.
- Ne pas éditer les variantes générées (`antigravity-agence-plugin/`, `codex-agence-plugin/`) à la main : tout part du maître.
- Pas de "Onboarding" au niveau du dossier racine.
