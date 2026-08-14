// Standalone admin page for VALO Lineups — no build step, plain JS.
// Reads/writes data/lineups.json and data/images/* directly via the GitHub
// Contents API, using a personal access token kept in localStorage.

const OWNER = 'LaSainteGuimauve'
const REPO = 'valo-lineups'
const BRANCH = 'main'
const DATA_PATH = 'data/lineups.json'
const IMAGES_PATH = 'data/images'
const TOKEN_KEY = 'valo-lineups-admin.token'

// Kept in sync with src/data/maps.ts — update both if the map/agent pool changes.
const MAPS = [
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

const AGENTS = [
  'Astra', 'Brimstone', 'Clove', 'Harbor', 'Omen', 'Viper',
  'Breach', 'Fade', 'Gekko', 'KAY/O', 'Skye', 'Sova', 'Tejo',
  'Killjoy', 'Chamber', 'Cypher', 'Deadlock', 'Sage', 'Vyse',
  'Jett', 'Neon', 'Phoenix', 'Raze', 'Reyna', 'Waylay', 'Yoru', 'Iso',
].sort()

function byId(id) {
  return document.getElementById(id)
}

let token = localStorage.getItem(TOKEN_KEY) || ''
let lineups = []
let lineupsSha = null
let editingId = null
let pendingImageDataUrl = null

function ghHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  }
}

async function ghGetFile(path) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: ghHeaders() },
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub API ${res.status} sur ${path}`)
  return res.json()
}

async function ghPutFile(path, base64Content, sha, message) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: base64Content,
      sha: sha || undefined,
      branch: BRANCH,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Échec écriture ${path}: ${res.status} ${body}`)
  }
  return res.json()
}

async function ghDeleteFile(path, sha, message) {
  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'DELETE',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  })
}

function populateSelects() {
  const mapSelect = byId('f-map')
  const filterMapSelect = byId('filter-map')
  mapSelect.innerHTML = MAPS.map((m) => `<option value="${m.id}">${m.name}</option>`).join('')
  filterMapSelect.innerHTML +=
    MAPS.map((m) => `<option value="${m.id}">${m.name}</option>`).join('')

  byId('f-agent').innerHTML = AGENTS.map((a) => `<option value="${a}">${a}</option>`).join('')

  updateSiteOptions()
  mapSelect.addEventListener('change', updateSiteOptions)
}

function updateSiteOptions() {
  const map = MAPS.find((m) => m.id === byId('f-map').value) || MAPS[0]
  byId('f-site').innerHTML = map.sites.map((s) => `<option value="${s}">${s}</option>`).join('')
}

function setStatus(message, isError) {
  const p = byId('form-status')
  p.textContent = message
  p.style.color = isError ? '#ff8b93' : 'var(--muted)'
}

async function loadLineups() {
  const file = await ghGetFile(DATA_PATH)
  if (!file) {
    lineups = []
    lineupsSha = null
    return
  }
  lineupsSha = file.sha
  const json = decodeURIComponent(escape(atob(file.content)))
  lineups = JSON.parse(json || '[]')
}

function renderList() {
  const filterMap = byId('filter-map').value
  const filtered = filterMap ? lineups.filter((l) => l.map === filterMap) : lineups
  byId('list-count').textContent = lineups.length

  byId('lineup-list').innerHTML = filtered
    .map((l) => {
      const mapName = MAPS.find((m) => m.id === l.map)?.name || l.map
      const thumb = l.imageUrl
        ? `<img src="${l.imageUrl}" alt="" />`
        : `<div style="width:48px;height:48px;border-radius:6px;background:rgba(255,255,255,.08)"></div>`
      return `
        <li data-id="${l.id}">
          ${thumb}
          <div class="list-item-info">
            <strong>${escapeHtml(l.title)}</strong>
            <span>${mapName} · ${escapeHtml(l.agent)} · Site ${escapeHtml(l.site)}</span>
          </div>
          <div class="list-item-actions">
            <button data-action="edit" title="Éditer">✎</button>
            <button data-action="delete" title="Supprimer">🗑</button>
          </div>
        </li>`
    })
    .join('')
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

function resetForm() {
  editingId = null
  pendingImageDataUrl = null
  byId('f-id').value = ''
  byId('f-ability').value = ''
  byId('f-title').value = ''
  byId('f-description').value = ''
  byId('f-image').value = ''
  byId('f-abilityType').value = 'smoke'
  byId('image-preview').innerHTML = ''
  byId('form-cancel').classList.add('hidden')
  setStatus('', false)
}

function fillForm(lineup) {
  editingId = lineup.id
  pendingImageDataUrl = null
  byId('f-id').value = lineup.id
  byId('f-map').value = lineup.map
  updateSiteOptions()
  byId('f-site').value = lineup.site
  byId('f-agent').value = lineup.agent
  byId('f-abilityType').value = lineup.abilityType
  byId('f-ability').value = lineup.ability
  byId('f-title').value = lineup.title
  byId('f-description').value = lineup.description || ''
  byId('image-preview').innerHTML = lineup.imageUrl ? `<img src="${lineup.imageUrl}" />` : ''
  byId('form-cancel').classList.remove('hidden')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit(e) {
  e.preventDefault()
  const submitBtn = byId('form-submit')
  submitBtn.disabled = true
  setStatus('Enregistrement en cours...', false)

  try {
    const id = editingId || crypto.randomUUID()
    let imageUrl = editingId ? lineups.find((l) => l.id === editingId)?.imageUrl : undefined

    if (pendingImageDataUrl) {
      const match = /^data:(image\/\w+);base64,(.+)$/.exec(pendingImageDataUrl)
      if (!match) throw new Error('Image invalide')
      const ext = match[1].split('/')[1].replace('jpeg', 'jpg')
      const filename = `${IMAGES_PATH}/${id}.${ext}`
      await ghPutFile(filename, match[2], null, `Add screenshot for ${id}`)
      imageUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${filename}`
    }

    const entry = {
      id,
      map: byId('f-map').value,
      site: byId('f-site').value,
      agent: byId('f-agent').value,
      abilityType: byId('f-abilityType').value,
      ability: byId('f-ability').value.trim(),
      title: byId('f-title').value.trim(),
      description: byId('f-description').value.trim(),
      ...(imageUrl ? { imageUrl } : {}),
    }

    const exists = lineups.some((l) => l.id === id)
    lineups = exists ? lineups.map((l) => (l.id === id ? entry : l)) : [...lineups, entry]

    await saveLineupsFile(exists ? `Update lineup ${id}` : `Add lineup ${id}`)

    resetForm()
    renderList()
    setStatus('Enregistré ✓', false)
  } catch (err) {
    setStatus(err.message, true)
  } finally {
    submitBtn.disabled = false
  }
}

async function saveLineupsFile(message) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(lineups, null, 2))))
  const result = await ghPutFile(DATA_PATH, content, lineupsSha, message)
  lineupsSha = result.content.sha
}

async function handleDelete(id) {
  if (!confirm('Supprimer ce line-up ?')) return
  const target = lineups.find((l) => l.id === id)
  lineups = lineups.filter((l) => l.id !== id)
  try {
    await saveLineupsFile(`Delete lineup ${id}`)
    if (target?.imageUrl?.includes(`/${IMAGES_PATH}/`)) {
      const path = target.imageUrl.split(`/${BRANCH}/`)[1]
      const file = await ghGetFile(path)
      if (file) await ghDeleteFile(path, file.sha, `Delete image for ${id}`)
    }
    renderList()
  } catch (err) {
    alert(err.message)
  }
}

function wireEvents() {
  byId('token-save').addEventListener('click', async () => {
    const value = byId('token-input').value.trim()
    if (!value) return
    token = value
    localStorage.setItem(TOKEN_KEY, token)
    await tryLogin()
  })

  byId('logout').addEventListener('click', () => {
    token = ''
    localStorage.removeItem(TOKEN_KEY)
    byId('app-panel').classList.add('hidden')
    byId('list-panel').classList.add('hidden')
    byId('auth-panel').classList.remove('hidden')
    byId('auth-status').textContent = ''
  })

  byId('lineup-form').addEventListener('submit', handleSubmit)
  byId('form-cancel').addEventListener('click', resetForm)

  byId('f-image').addEventListener('change', (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      pendingImageDataUrl = reader.result
      byId('image-preview').innerHTML = `<img src="${pendingImageDataUrl}" />`
    }
    reader.readAsDataURL(file)
  })

  byId('filter-map').addEventListener('change', renderList)

  byId('lineup-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button')
    if (!btn) return
    const id = btn.closest('li').dataset.id
    if (btn.dataset.action === 'edit') fillForm(lineups.find((l) => l.id === id))
    if (btn.dataset.action === 'delete') handleDelete(id)
  })
}

async function tryLogin() {
  byId('auth-status').textContent = 'Connexion...'
  try {
    await loadLineups()
    byId('auth-panel').classList.add('hidden')
    byId('app-panel').classList.remove('hidden')
    byId('list-panel').classList.remove('hidden')
    byId('auth-status').textContent = `Connecté · ${lineups.length} line-ups`
    renderList()
  } catch (err) {
    byId('auth-status').textContent = ''
    alert(`Connexion impossible : ${err.message}\nVérifie le token et ses permissions.`)
    token = ''
    localStorage.removeItem(TOKEN_KEY)
  }
}

populateSelects()
wireEvents()
if (token) tryLogin()
