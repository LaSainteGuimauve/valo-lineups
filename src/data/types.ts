export type AbilityType = 'smoke' | 'molly' | 'flash' | 'recon' | 'wall' | 'trap' | 'other'

export interface Lineup {
  id: string
  map: string
  agent: string
  site: string
  ability: string
  abilityType: AbilityType
  title: string
  description: string
  imageUrl?: string
}

export interface MapInfo {
  id: string
  name: string
  sites: string[]
}
