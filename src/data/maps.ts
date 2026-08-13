import type { MapInfo } from './types'

export const MAPS: MapInfo[] = [
  { id: 'ascent', name: 'Ascent', sites: ['A', 'B'] },
  { id: 'bind', name: 'Bind', sites: ['A', 'B'] },
  { id: 'breeze', name: 'Breeze', sites: ['A', 'B'] },
  { id: 'fracture', name: 'Fracture', sites: ['A', 'B'] },
  { id: 'haven', name: 'Haven', sites: ['A', 'B', 'C'] },
  { id: 'icebox', name: 'Icebox', sites: ['A', 'B'] },
  { id: 'lotus', name: 'Lotus', sites: ['A', 'B', 'C'] },
  { id: 'pearl', name: 'Pearl', sites: ['A', 'B'] },
  { id: 'split', name: 'Split', sites: ['A', 'B'] },
  { id: 'sunset', name: 'Sunset', sites: ['A', 'B'] },
  { id: 'abyss', name: 'Abyss', sites: ['A', 'B'] },
  { id: 'corrode', name: 'Corrode', sites: ['A', 'B'] },
]

export const AGENTS = [
  'Astra', 'Brimstone', 'Clove', 'Harbor', 'Omen', 'Viper',
  'Breach', 'Fade', 'Gekko', 'KAY/O', 'Skye', 'Sova', 'Tejo',
  'Killjoy', 'Chamber', 'Cypher', 'Deadlock', 'Sage', 'Vyse',
  'Jett', 'Neon', 'Phoenix', 'Raze', 'Reyna', 'Waylay', 'Yoru', 'Iso',
].sort()
