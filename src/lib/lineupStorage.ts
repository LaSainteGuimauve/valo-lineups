import type { Lineup } from '../data/types'

const LOCAL_STORAGE_KEY = 'valo-lineups.custom-lineups'

export async function loadCustomLineups(): Promise<Lineup[]> {
  if (window.overlay?.loadCustomLineups) {
    return window.overlay.loadCustomLineups()
  }
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

export async function saveCustomLineups(lineups: Lineup[]): Promise<void> {
  if (window.overlay?.saveCustomLineups) {
    await window.overlay.saveCustomLineups(lineups)
    return
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lineups))
}
