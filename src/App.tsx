import { useEffect, useMemo, useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { LineupCard } from './components/LineupCard'
import { LineupManager } from './components/LineupManager'
import { MAPS, AGENTS } from './data/maps'
import { LINEUPS } from './data/lineups'
import { loadCustomLineups, saveCustomLineups } from './lib/lineupStorage'
import { loadCloudLineups } from './lib/cloudLineups'
import type { Lineup } from './data/types'
import './App.css'

type View = 'browse' | 'manage'

export default function App() {
  const [clickThrough, setClickThrough] = useState(false)
  const [view, setView] = useState<View>('browse')
  const [mapId, setMapId] = useState(MAPS[0].id)
  const [agent, setAgent] = useState<string>('Tous')
  const [site, setSite] = useState<string>('Tous')
  const [customLineups, setCustomLineups] = useState<Lineup[]>([])
  const [cloudLineups, setCloudLineups] = useState<Lineup[]>([])

  useEffect(() => {
    window.overlay?.onClickThroughChanged?.(setClickThrough)
  }, [])

  useEffect(() => {
    loadCustomLineups().then(setCustomLineups)
    loadCloudLineups().then(setCloudLineups)
  }, [])

  const allLineups = useMemo(() => [...LINEUPS, ...cloudLineups, ...customLineups], [cloudLineups, customLineups])

  const currentMap = MAPS.find((m) => m.id === mapId)!

  const filtered = useMemo(() => {
    return allLineups
      .filter((l) => l.map === mapId)
      .filter((l) => agent === 'Tous' || l.agent === agent)
      .filter((l) => site === 'Tous' || l.site === site)
  }, [allLineups, mapId, agent, site])

  function handleSaveLineup(lineup: Lineup) {
    setCustomLineups((prev) => {
      const exists = prev.some((l) => l.id === lineup.id)
      const next = exists ? prev.map((l) => (l.id === lineup.id ? lineup : l)) : [...prev, lineup]
      saveCustomLineups(next)
      return next
    })
  }

  function handleDeleteLineup(id: string) {
    setCustomLineups((prev) => {
      const next = prev.filter((l) => l.id !== id)
      saveCustomLineups(next)
      return next
    })
  }

  return (
    <div className="overlay-root">
      <TitleBar clickThrough={clickThrough} />

      <div className="view-tabs">
        <button
          className={view === 'browse' ? 'tab active' : 'tab'}
          onClick={() => setView('browse')}
        >
          Parcourir
        </button>
        <button
          className={view === 'manage' ? 'tab active' : 'tab'}
          onClick={() => setView('manage')}
        >
          Ajouts locaux ({customLineups.length})
        </button>
      </div>

      {view === 'browse' ? (
        <>
          <div className="filters">
            <select value={mapId} onChange={(e) => { setMapId(e.target.value); setSite('Tous') }}>
              {MAPS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <select value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="Tous">Tous les sites</option>
              {currentMap.sites.map((s) => (
                <option key={s} value={s}>Site {s}</option>
              ))}
            </select>

            <select value={agent} onChange={(e) => setAgent(e.target.value)}>
              <option value="Tous">Tous les agents</option>
              {AGENTS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="lineup-list">
            {filtered.length === 0 && (
              <p className="empty-state">Aucun line-up enregistré pour ce filtre pour l'instant.</p>
            )}
            {filtered.map((lineup) => (
              <LineupCard key={lineup.id} lineup={lineup} />
            ))}
          </div>
        </>
      ) : (
        <div className="lineup-list">
          <LineupManager lineups={customLineups} onSave={handleSaveLineup} onDelete={handleDeleteLineup} />
        </div>
      )}
    </div>
  )
}
