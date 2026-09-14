# maceo-narbonnet.github.io

Portfolio de Macéo Narbonnet — élève ingénieur en informatique (UTC), systèmes embarqués, robotique et vision par ordinateur.

Site statique construit avec [Astro](https://astro.build), bilingue FR/EN, déployé sur GitHub Pages à chaque push sur `main`.

## Développer

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
```

## Ajouter ou modifier un projet

Chaque projet est un fichier Markdown avec un en-tête (frontmatter) dans `src/content/projects/fr/` et son équivalent dans `src/content/projects/en/`.
Le champ `slug` doit être identique dans les deux langues ; `order` fixe l'ordre d'affichage ; le premier projet est mis en avant.

Les images vont dans `public/img/` (WebP recommandé, ≤ 1600 px de large). Les CV PDF sont dans `public/cv/`.

Les textes de la page d'accueil (accroche, parcours, compétences, contact) sont dans `src/data/site.ts`.
