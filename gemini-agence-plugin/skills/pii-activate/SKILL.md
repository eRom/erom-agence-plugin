---
description: Active/désactive le masquage PII (IP, emails, chemins perso) à l'écran et vers l'IA, pour les partages d'écran/visio/stream. Les credentials restent TOUJOURS masqués, indépendamment de cette commande.
---

Argument fourni : `$ARGUMENTS`  (par défaut `on`)

Pilote le masquage PII via le CLI dédié. Exécute la commande Bash :

`bun "${GEMINI_PLUGIN_ROOT}/hooks/redact-display.ts" <arg>`

où `<arg>` vaut `$ARGUMENTS` si c'est `on`, `off` (par défaut `on`)

Le CLI écrit l'état global dans `~/.config/caserne/pii` ; les deux hooks
(`redact-context`, `redact-display`) le relisent à chaque appel (effet immédiat).

Rapporte l'état obtenu en **une seule ligne**, sans rien ajouter d'autre.
