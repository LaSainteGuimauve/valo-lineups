import type { Lineup } from './data/types'

export {}

declare global {
  interface Window {
    overlay: {
      closeApp: () => void
      minimize: () => void
      onClickThroughChanged: (callback: (clickThrough: boolean) => void) => void
      loadCustomLineups: () => Promise<Lineup[]>
      saveCustomLineups: (lineups: Lineup[]) => Promise<boolean>
    }
  }
}
