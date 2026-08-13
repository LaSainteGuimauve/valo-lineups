import type { Lineup } from './types'

// Seed data — replace/extend with your own screenshots and line-up notes.
// Each lineup needs a map id (see maps.ts), an agent, a site, and an image or video.
export const LINEUPS: Lineup[] = [
  {
    id: 'ascent-viper-a-smoke-1',
    map: 'ascent',
    agent: 'Viper',
    site: 'A',
    ability: "Poison Cloud",
    abilityType: 'smoke',
    title: 'A Main full smoke depuis spawn',
    description: "Position contre le mur de spawn, viser le coin du generateur. Couvre tout A Main.",
  },
  {
    id: 'bind-brimstone-b-smoke-1',
    map: 'bind',
    agent: 'Brimstone',
    site: 'B',
    ability: 'Sky Smoke',
    abilityType: 'smoke',
    title: 'B Site smoke depuis Hookah',
    description: "Placer le marqueur sur le bord du site pour bloquer la vue depuis Showers et Elbow.",
  },
]
