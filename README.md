# VALO Lineups

Overlay compagnon pour Valorant : sélection manuelle map / site / agent, affichage
des line-ups (image ou vidéo) par-dessus le jeu (fenêtré ou borderless).

Ce projet n'utilise **aucune lecture de mémoire du jeu ni d'API live** — Riot ne
fournit pas de flux temps réel pour Valorant, et Vanguard (l'anti-cheat) interdit
toute interaction avec le processus du jeu. L'app reste donc un simple overlay
piloté à la main, ce qui est l'approche utilisée par tous les outils de ce type
qui existent aujourd'hui.

## Stack

- Electron (fenêtre overlay transparente, toujours au-dessus)
- React + TypeScript + Vite (interface)
- electron-updater (mise à jour automatique en arrière-plan)

## Installation (utilisateur final)

Télécharge le dernier installeur depuis l'onglet
[Releases](https://github.com/LaSainteGuimauve/valo-lineups/releases) (fichier
`.exe` pour Windows) et lance-le. Aucune commande requise, et l'app se met à
jour toute seule ensuite (vérification au démarrage + toutes les heures,
installation silencieuse au prochain redémarrage de l'app).

## Développement

```bash
npm install
npm run electron:dev
```

Lance Vite en dev server + Electron en parallèle, avec hot-reload du renderer.

## Build / packaging

```bash
npm run electron:package
```

Génère l'installeur (`release/`) via electron-builder (NSIS sur Windows, dmg sur
Mac, AppImage sur Linux).

## Publier une nouvelle version

Une release GitHub Actions (`.github/workflows/release.yml`) se déclenche sur
chaque tag `vX.Y.Z` poussé sur `main` : elle build l'installeur Windows et le
publie automatiquement sur la page Releases. Les apps déjà installées le
détecteront ensuite toutes seules via electron-updater, sans action de
l'utilisateur.

```bash
npm version patch   # ou minor / major — bump package.json + crée le tag git
git push && git push --tags
```

## Raccourcis clavier (globaux, fonctionnent même jeu au premier plan)

- `Ctrl+Shift+L` : afficher / masquer l'overlay
- `Ctrl+Shift+K` : activer / désactiver le click-through (laisse les clics
  passer à travers vers le jeu, utile pendant que tu joues)

## Ajouter des line-ups

Les données vivent dans `src/data/lineups.ts` (structure définie dans
`src/data/types.ts`). Chaque entrée a une map, un agent, un site, une capacité,
et une image (`imageUrl`) ou vidéo (`videoUrl`). Place tes médias dans
`public/lineups/` et référence-les en `/lineups/nom-du-fichier.png`.

## Prochaines étapes possibles

- Écran d'édition/import de line-ups directement dans l'app
- Recherche/tri par capacité (smoke, molly, flash...)
- Mode "favoris" par agent joué
- Détection de la map via OCR sur le menu (sans lire la mémoire du jeu) pour
  pré-sélectionner automatiquement le filtre
