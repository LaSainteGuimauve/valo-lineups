import type { Lineup } from '../data/types'

const CLOUD_URL = 'https://raw.githubusercontent.com/LaSainteGuimauve/valo-lineups/main/data/lineups.json'

// Fetches the shared line-ups added via the web admin (docs/) from GitHub.
// Falls back to whatever was cached from the last successful fetch when offline.
export async function loadCloudLineups(): Promise<Lineup[]> {
  try {
    const res = await fetch(`${CLOUD_URL}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const lineups: Lineup[] = await res.json()
    localStorage.setItem('valo-lineups.cloud-cache', JSON.stringify(lineups))
    return lineups
  } catch {
    const cached = localStorage.getItem('valo-lineups.cloud-cache')
    return cached ? JSON.parse(cached) : []
  }
}
