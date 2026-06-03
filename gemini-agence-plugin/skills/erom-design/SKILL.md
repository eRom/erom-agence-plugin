---
name: erom-design
description: Design system Romain - apps web/desktop/mobile. Dark-first, surfaces neutres, brand paramétrique (défaut amber), borders  shadows, OKLCH, Inter + JetBrains Mono.
---

# erom-design v2

Design system extrait de shadcn-demo-vite. Remplace erom-design v1.
Source de verite des valeurs : fichiers DTCG dans `references/`.

## Philosophie - Les 5 piliers

1. **Dark-first, surfaces neutres.** Le dark mode est l'experience principale. Les surfaces sombres utilisent des gris a chroma tres faible (0 a 0.01) en OKLCH. La hue varie selon la surface (neutre pur hue 0, cool hue 114, ou chaud hue 56-67 selon le cas). La chaleur vient du brand amber, pas du fond. Les valeurs exactes sont dans `references/primitives.tokens.json` (neutral.dark-*).

2. **Borders > Shadows.** La hierarchie visuelle se cree par des bordures, pas des ombres. Les shadows sont reservees aux elements flottants (dialogs, popovers, dropdowns). Le pattern `hover-elevate` ajoute une elevation subtile au hover via box-shadow + translateY(-1px).

3. **Couleur = sens, jamais decoration.** Chaque couleur a un role semantique. Pattern universel badges : `bg-{color}-500/10 text-{color}-400`. Status colors dedies (online/away/busy/offline).

4. **Densite maitrisee.** Texte principal `text-sm` (14px), nav `text-[13px]`, badges `text-[10px]`. Gaps serres : `gap-1` a `gap-3`.

5. **Transitions subtiles.** 150-200ms, `ease-out`. Jamais de bounce ou d'effets spectaculaires.

## Stack technique

- **Tailwind CSS v4+** : `@import "tailwindcss"` + `@import "tw-animate-css"`
- **CSS variables en OKLCH** - pas de `dark:` en dur
- **`@custom-variant dark`** : `(&:where(.dark, .dark *))`
- **Fonts** : Inter (sans), JetBrains Mono (mono), Georgia (serif)
- **lucide-react** exclusivement
- **React** composants fonctionnels
- **shadcn/ui** style "new-york"
- **class-variance-authority** (cva)

## Code source Typescript (demo)

- Stack Vite : `references/vite-demo-sources/`

## Couleur brand parametrique

La couleur brand (`--primary`) est parametrique. Defaut : amber.

Regle foreground : si L > 0.7 dans OKLCH, foreground sombre. Sinon blanc.

### Table de conversion brand

| Demande | Token primitif |
|---------|---------------|
| amber (defaut) | `{brand.amber}` |
| bleu | `{accent.blue}` |
| vert / emeraude | `{accent.emerald}` |
| rouge | `{accent.red}` |
| violet | `{accent.violet}` |
| rose | `{accent.pink}` |
| cyan | `{accent.cyan}` |

Pour les valeurs exactes, voir `references/primitives.tokens.json`.

## Ou s'applique la couleur brand

| Composant | Application |
|-----------|-------------|
| Bouton principal / CTA | `bg-primary text-primary-foreground border border-primary-border` |
| Toggles / switches actifs | `bg-primary`, thumb = `bg-background` |
| Focus ring | `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` |
| Selection texte | `::selection { background-color: oklch(var(--primary)) }` |
| Sidebar lien actif | `text-sidebar-primary` |
| Ring sidebar | `focus-visible:ring-2 focus-visible:ring-sidebar-ring` |
| Notification badge | `bg-primary text-[10px] font-semibold text-primary-foreground` |
| Charts | `chart-1` = derive de primary |

## CSS Variables - Structure Tailwind v4

Lire `references/primitives.tokens.json` et les fichiers semantiques pour les valeurs exactes OKLCH.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-card-border: var(--card-border);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover-border: var(--popover-border);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 5px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);
}
```

Les variables `:root` et `.dark` contiennent les valeurs OKLCH - voir tokens semantiques.

## Patterns composants

### Button

4 variantes + 4 tailles. Pattern `hover-elevate` + `active-elevate-2`.

```
Base : inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
       disabled:pointer-events-none disabled:opacity-50
       [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
       hover-elevate active-elevate-2

default      : bg-primary text-primary-foreground border border-primary-border
destructive  : bg-destructive text-destructive-foreground border border-destructive-border
outline      : border [border-color:var(--button-outline)] shadow-xs
secondary    : bg-secondary text-secondary-foreground border border-secondary-border
ghost        : border border-transparent

Sizes :
  default : min-h-9 px-4 py-2
  sm      : min-h-8 rounded-md px-3 text-xs
  lg      : min-h-10 rounded-md px-8
  icon    : h-9 w-9
```

Note : les hauteurs sont `min-h-*` pour s'adapter au contenu.

### Card

```
rounded-xl border bg-card border-card-border text-card-foreground shadow-sm
Header  : flex flex-col space-y-1.5 p-6
Title   : text-2xl font-semibold leading-none tracking-tight
Desc    : text-sm text-muted-foreground
Content : p-6 pt-0
Footer  : flex items-center p-6 pt-0
```

### Badge

```
whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold
hover-elevate

default      : border-transparent bg-primary text-primary-foreground shadow-xs
secondary    : border-transparent bg-secondary text-secondary-foreground
destructive  : border-transparent bg-destructive text-destructive-foreground shadow-xs
outline      : border [border-color:var(--badge-outline)] shadow-xs
```

### Input

```
h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base
placeholder:text-muted-foreground
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
disabled:cursor-not-allowed disabled:opacity-50
md:text-sm
```

### Dialog / Modal

```
Overlay  : fixed inset-0 bg-black/50 z-50
Content  : rounded-lg border bg-background p-6 shadow-lg
Title    : text-lg font-semibold
Desc     : text-sm text-muted-foreground
Footer   : flex justify-end gap-3
```

### Dropdown / Popover

```
Content  : bg-popover/95 backdrop-blur-xl text-popover-foreground rounded-md border p-1 shadow-md
Item     : px-2 py-1.5 text-sm rounded-sm focus:bg-accent focus:text-accent-foreground
Separator: bg-border -mx-1 my-1 h-px
```

Cle : `bg-popover/95 backdrop-blur-xl` - semi-transparent avec blur.

### Sidebar

```
Container : bg-sidebar border-r border-sidebar-border flex h-full flex-col select-none overflow-hidden

Nav items :
  inactive : text-sidebar-foreground/70 hover:bg-sidebar-accent/50
  active   : bg-sidebar-accent text-sidebar-accent-foreground

Section headers :
  sticky top-0 z-10 bg-sidebar/95 backdrop-blur-sm
  text-[11px] font-semibold tracking-wide uppercase text-sidebar-foreground/40
```

### Delete confirmation inline

```
Container : bg-destructive/10 border border-destructive/20 rounded-lg px-2.5 py-2
Confirm   : bg-destructive hover:bg-destructive/90 text-destructive-foreground
Cancel    : border border-border hover:bg-accent
```

## Utilities CSS custom

Ces utilities DOIVENT etre incluses dans chaque projet :

```css
@layer utilities {
  .hover-elevate {
    transition: box-shadow 150ms ease, transform 150ms ease;
  }
  .hover-elevate:hover {
    box-shadow: var(--elevate-1) 0 0 0 1px, var(--elevate-2) 0 4px 8px;
    transform: translateY(-1px);
  }

  .active-elevate-2:active {
    box-shadow: var(--elevate-2) 0 0 0 1px;
    transform: translateY(0px);
  }

  .toggle-elevate {
    transition: box-shadow 150ms ease, transform 150ms ease;
  }
  .toggle-elevated {
    box-shadow: var(--elevate-1) 0 0 0 1px, var(--elevate-2) 0 4px 8px;
  }

  .no-default-active-elevate:active {
    transform: none !important;
    box-shadow: none !important;
  }
}
```

## Opaque button border

Pattern unique : les bordures de boutons sont calculees dynamiquement :

```css
--primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
```

`--opaque-button-border-intensity` = `-8` light (plus sombre) / `9` dark (plus claire).

S'applique a : primary, secondary, muted, accent, destructive, sidebar-primary, sidebar-accent.

## Couleurs d'accent semantiques

| Role | Couleur | Badge pattern |
|------|---------|---------------|
| Principal | blue | `bg-blue-500/10 text-blue-400` |
| Succes | emerald | `bg-emerald-500/10 text-emerald-400` |
| Warning | amber | `bg-amber-500/10 text-amber-400` |
| Info | violet | `bg-violet-500/10 text-violet-400` |
| Danger | pink | `bg-pink-500/10 text-pink-400` |
| Neutre | cyan | `bg-cyan-500/10 text-cyan-400` |
| Desactive | gray | `bg-gray-500/10 text-gray-400` |

Pattern universel : `bg-{color}-500/10 text-{color}-400` - TOUJOURS.

## Typographie

| Element | Classes | Taille |
|---------|---------|--------|
| Titre page | `text-2xl font-bold` | 24px |
| Sous-titre | `text-lg font-semibold` | 18px |
| Corps principal | `text-sm` | 14px |
| Nav sidebar | `text-[13px] font-medium leading-tight` | 13px |
| Metadata/muted | `text-xs text-muted-foreground` | 12px |
| Section header | `text-[11px] font-semibold tracking-wide uppercase` | 11px |
| Badge | `text-[10px] font-medium` | 10px |
| Stat KPI | `text-3xl font-bold` | 30px |
| Label formulaire | `text-sm font-medium` | 14px |

## Icones - lucide-react

Librairie unique. Jamais d'autre.

| Taille | Classes | Usage |
|--------|---------|-------|
| Standard | `w-4 h-4` | Partout |
| Petite | `w-3.5 h-3.5` | Inline, chevrons |
| Grande | `w-5 h-5` | Headers, empty states |
| Sidebar expanded | `size-4` | Nav items |
| Sidebar collapsed | `size-4.5` | Icones centrees |

## Layout

### App shell adaptable

**Web** :
```
flex min-h-screen flex-col
  sidebar (collapsible) + main content
```

**Desktop (Electron/Tauri)** :
```
flex h-screen w-screen flex-col overflow-hidden
  TopBar (h-[38px])
  flex flex-1 min-h-0
    Sidebar (300px | 52px)
    main (flex-1)
    RightPanel (300px | 40px, optionnel)
```

**Mobile** :
```
Sidebar : fixed, -translate-x-full lg:translate-x-0
Overlay : fixed inset-0 bg-black/50 z-30
Hamburger : lg:hidden fixed top-3 left-3 z-50
```

### Dimensions fixes

| Element | Expanded | Collapsed | Animation |
|---------|----------|-----------|-----------|
| Sidebar gauche | 300px | 52px | `transition-[width] duration-200 ease-out` |
| Top bar | 38px | -- | fixe |
| Right panel | 300px | 40px | `transition-[width] duration-200 ease-out` |

## Animations & Transitions

| Contexte | Classes |
|----------|---------|
| Boutons, nav | `transition-colors` |
| Cards, panneaux | `transition-all duration-200` |
| Sidebar width | `transition-[width] duration-200 ease-out` |
| Hover reveal | `transition-opacity duration-150` |
| Transform (rotate) | `transition-transform duration-200` |
| Dropdown apparition | `animate-in fade-in-0 zoom-in-95 duration-150` |

## Details de finition

### Scrollbar custom (WebKit)

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--muted-foreground); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--foreground); }
```

### Selection de texte

```css
::selection {
  background-color: oklch(var(--primary));
  color: oklch(var(--primary-foreground));
}
```

### Sticky headers avec blur

```
sticky top-0 z-10 bg-sidebar/95 backdrop-blur-sm
```

### Focus states

```
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
```

Sidebar : `focus-visible:ring-2 focus-visible:ring-sidebar-ring`

### Responsive

- Grids : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Container : `max-w-6xl mx-auto` (listes) ou `max-w-3xl mx-auto` (forms)

### Opacites recurrentes

| Pattern | Usage |
|---------|-------|
| `/5` | badge-outline |
| `/10` | bordures dark, fond badges semantiques |
| `/15` | fond inputs dark |
| `/40` | texte tres muted, section headers |
| `/50` | ring focus |
| `/60` | bordures interactives |
| `/70` | texte inactif sidebar |
| `/90` | hover primary |
| `/95` | fond popover/sticky + blur |

## Design Tokens DTCG

```
references/
  primitives.tokens.json     -- valeurs brutes OKLCH
  semantic-dark.tokens.json  -- mapping dark mode
  semantic-light.tokens.json -- mapping light mode
  erom.resolver.json         -- assemblage, dark = defaut
```

Structure 3 couches :

```
primitives.tokens.json          <- valeurs brutes OKLCH
    | references {token.path}
semantic-dark/light.tokens.json <- mapping par mode
    | resolution order
erom.resolver.json              <- assemblage final
```

Pour changer la couleur brand : modifier `brand.amber` dans primitives, tout le reste suit via references.

## Checklist avant livraison

```
- [ ] `.dark` est la classe par defaut sur `<html>`
- [ ] CSS variables en OKLCH, zero hex en dur (sauf badges Tailwind)
- [ ] Bordures > shadows pour la hierarchie
- [ ] Surfaces dark en gris neutres (chroma < 0.01)
- [ ] `--primary` = couleur brand du projet (amber par defaut)
- [ ] `--ring` = primary
- [ ] lucide-react uniquement, `w-4 h-4`, couleur via `currentColor`
- [ ] Badges semantiques : `bg-{color}-500/10 text-{color}-400`
- [ ] Texte principal `text-sm`, nav `text-[13px]`, badges `text-[10px]`
- [ ] Pattern `hover-elevate` sur boutons et badges
- [ ] Opaque button border via `hsl(from ...)` sur variantes colorees
- [ ] `--button-outline` et `--badge-outline` pour variantes outline
- [ ] Scrollbar custom 6px (WebKit)
- [ ] Transitions sur tous les elements interactifs (150-200ms)
- [ ] Popovers : `bg-popover/95 backdrop-blur-xl`
- [ ] Sticky headers : `bg-sidebar/95 backdrop-blur-sm`
- [ ] `::selection` en couleur primary
- [ ] `tw-animate-css` pour animations d'entree
- [ ] Inter + JetBrains Mono (fonts)
- [ ] Tailwind v4+ (`@import "tailwindcss"`)
```
