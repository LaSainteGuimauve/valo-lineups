import { useEffect, useMemo, useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { LineupCard } from './components/LineupCard'
import { MAPS, AGENTS } from './data/maps'
import { LINEUPS } from './data/lineups'
import './App.css'

export default function App() {
  const [clickThrough, setClickThrough] = useState(false)
  const [mapId, setMapId] = useState(MAPS[0].id)
  const [agent, setAgent] = useState<string>('Tous')
  const [site, setSite] = useState<string>('Tous')

  useEffect(() => {
    window.overlay?.onClickThroughChanged?.(setClickThrough)
  }, [])

  const currentMap = MAPS.find((m) => m.id === mapId)!

  const filtered = useMemo(() => {
    return LINEUPS.filter((l) => l.map === mapId)
      .filter((l) => agent === 'Tous' || l.agent === agent)
      .filter((l) => site === 'Tous' || l.site === site)
  }, [mapId, agent, site])

  return (
    <div className="overlay-root">
      <TitleBar clickThrough={clickThrough} />

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
    </div>
  )
}
