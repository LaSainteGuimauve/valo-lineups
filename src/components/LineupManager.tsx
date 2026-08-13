import { useState } from 'react'
import type { Lineup } from '../data/types'
import { MAPS } from '../data/maps'
import { LineupForm } from './LineupForm'

interface Props {
  lineups: Lineup[]
  onSave: (lineup: Lineup) => void
  onDelete: (id: string) => void
}

export function LineupManager({ lineups, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState<Lineup | null>(null)
  const [creating, setCreating] = useState(false)

  if (creating || editing) {
    return (
      <LineupForm
        initial={editing ?? undefined}
        onSave={(lineup) => {
          onSave(lineup)
          setCreating(false)
          setEditing(null)
        }}
        onCancel={() => {
          setCreating(false)
          setEditing(null)
        }}
      />
    )
  }

  return (
    <div className="manager">
      <button className="btn-primary btn-full" onClick={() => setCreating(true)}>
        + Ajouter un line-up
      </button>

      {lineups.length === 0 && (
        <p className="empty-state">Aucun line-up perso pour l'instant. Ajoute le premier !</p>
      )}

      <ul className="manager-list">
        {lineups.map((l) => (
          <li key={l.id} className="manager-item">
            <div>
              <strong>{l.title}</strong>
              <span className="lineup-meta">
                {MAPS.find((m) => m.id === l.map)?.name ?? l.map} · {l.agent} · Site {l.site}
              </span>
            </div>
            <div className="manager-item-actions">
              <button onClick={() => setEditing(l)} title="Éditer">✎</button>
              <button onClick={() => onDelete(l.id)} title="Supprimer">🗑</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
