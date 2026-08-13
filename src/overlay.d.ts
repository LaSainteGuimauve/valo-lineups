export {}

declare global {
  interface Window {
    overlay: {
      closeApp: () => void
      minimize: () => void
      onClickThroughChanged: (callback: (clickThrough: boolean) => void) => void
    }
  }
}
