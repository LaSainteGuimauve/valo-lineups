import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('overlay', {
  closeApp: () => ipcRenderer.send('close-app'),
  minimize: () => ipcRenderer.send('minimize-window'),
  onClickThroughChanged: (callback: (clickThrough: boolean) => void) => {
    ipcRenderer.on('click-through-changed', (_event, value) => callback(value))
  },
})
