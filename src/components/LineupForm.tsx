import { useState, type FormEvent } from 'react'
import { MAPS, AGENTS } from '../data/maps'
import type { AbilityType, Lineup } from '../data/types'

const ABILITY_TYPES: AbilityType[] = ['smoke', 'molly', 'flash', 'recon', 'wall', 'trap', 'other']

const emptyForm = (mapId: string): Lineup => ({
  id: '',
  map: mapId,
  agent: AGENTS[0],
  site: MAPS.find((m) => m.id === mapId)?.sites[0] ?? 'A',
  ability: '',
  abilityType: 'smoke',
  title: '',
  description: '',
})

interface Props {
  initial?: Lineup
  onSave: (lineup: Lineup) => void
  onCancel: () => void
}

export function LineupForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Lineup>(initial ?? emptyForm(MAPS[0].id))
  const currentMap = MAPS.find((m) => m.id === form.map) ?? MAPS[0]

  function update<K extends keyof Lineup>(key: K, value: Lineup[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleFile(kind: 'imageUrl' | 'videoUrl', file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update(kind, reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.ability.trim()) return
    onSave({
      ...form,
      id: form.id || crypto.randomUUID(),
    })
  }

  return (
    <form className="lineup-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Map
          <select
            value={form.map}
            onChange={(e) => {
              const map = e.target.value
              const site = MAPS.find((m) => m.id === map)?.sites[0] ?? 'A'
              setForm((f) => ({ ...f, map, site }))
            }}
          >
            {MAPS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>

        <label>
          Site
          <select value={form.site} onChange={(e) => update('site', e.target.value)}>
            {currentMap.sites.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Agent
          <select value={form.agent} onChange={(e) => update('agent', e.target.value)}>
            {AGENTS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          Type de capacité
          <select value={form.abilityType} onChange={(e) => update('abilityType', e.target.value as AbilityType)}>
            {ABILITY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Nom de la capacité
        <input
          type="text"
          value={form.ability}
          onChange={(e) => update('ability', e.target.value)}
          placeholder="ex: Poison Cloud"
          required
        />
      </label>

      <label>
        Titre du line-up
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="ex: A Main full smoke depuis spawn"
          required
        />
      </label>

      <label>
        Description / position
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          placeholder="Où se placer, où viser, repères..."
        />
      </label>

      <div className="form-row">
        <label>
          Image (optionnel)
          <input type="file" accept="image/*" onChange={(e) => handleFile('imageUrl', e.target.files?.[0])} />
        </label>
        <label>
          Vidéo (optionnel)
          <input type="file" accept="video/*" onChange={(e) => handleFile('videoUrl', e.target.files?.[0])} />
        </label>
      </div>

      {(form.imageUrl || form.videoUrl) && (
        <div className="form-preview">
          {form.imageUrl && <img src={form.imageUrl} alt="preview" />}
          {form.videoUrl && <video src={form.videoUrl} controls />}
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" className="btn-primary">Enregistrer</button>
      </div>
    </form>
  )
}
