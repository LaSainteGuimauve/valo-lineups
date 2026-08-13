import type { Lineup } from '../data/types'

const ABILITY_LABEL: Record<Lineup['abilityType'], string> = {
  smoke: 'Smoke',
  molly: 'Molotov',
  flash: 'Flash',
  recon: 'Recon',
  wall: 'Mur',
  trap: 'Piège',
  other: 'Autre',
}

export function LineupCard({ lineup }: { lineup: Lineup }) {
  return (
    <article className="lineup-card">
      <header>
        <span className={`badge badge-${lineup.abilityType}`}>{ABILITY_LABEL[lineup.abilityType]}</span>
        <h3>{lineup.title}</h3>
      </header>
      <p className="lineup-meta">
        {lineup.agent} · Site {lineup.site} · {lineup.ability}
      </p>
      {lineup.imageUrl && <img src={lineup.imageUrl} alt={lineup.title} className="lineup-media" />}
      {lineup.videoUrl && (
        <video src={lineup.videoUrl} controls className="lineup-media" />
      )}
      <p className="lineup-description">{lineup.description}</p>
    </article>
  )
}
