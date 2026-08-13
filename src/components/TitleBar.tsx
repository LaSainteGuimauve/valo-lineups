interface Props {
  clickThrough: boolean
}

export function TitleBar({ clickThrough }: Props) {
  return (
    <div className="titlebar">
      <span className="titlebar-title">VALO Lineups</span>
      <span className="titlebar-hint">
        {clickThrough ? 'Click-through actif (Ctrl+Shift+K)' : 'Ctrl+Shift+L masquer · Ctrl+Shift+K click-through'}
      </span>
      <div className="titlebar-actions">
        <button onClick={() => window.overlay?.minimize()} title="Réduire">
          _
        </button>
        <button onClick={() => window.overlay?.closeApp()} title="Fermer">
          ×
        </button>
      </div>
    </div>
  )
}
