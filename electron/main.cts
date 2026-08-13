import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'node:path'
import fs from 'node:fs/promises'

const isDev = !app.isPackaged
const customLineupsPath = () => path.join(app.getPath('userData'), 'custom-lineups.json')

let mainWindow: BrowserWindow | null = null

function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: 420,
    height: 640,
    x: width - 440,
    y: 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Keeps the overlay above a fullscreen/borderless Valorant window.
  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  if (!isDev) {
    // Checks GitHub Releases for a newer version, downloads it in the background,
    // and installs it automatically the next time the app quits — no user action needed.
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error('Update check failed:', err)
    })
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify().catch(() => {})
    }, 60 * 60 * 1000)
  }

  // Ctrl+Shift+L toggles overlay visibility without alt-tabbing out of the game.
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (!mainWindow) return
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })

  // Ctrl+Shift+K toggles click-through so the overlay doesn't steal mouse focus from the game.
  let clickThrough = false
  globalShortcut.register('CommandOrControl+Shift+K', () => {
    if (!mainWindow) return
    clickThrough = !clickThrough
    mainWindow.setIgnoreMouseEvents(clickThrough, { forward: true })
    mainWindow.webContents.send('click-through-changed', clickThrough)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

ipcMain.on('close-app', () => {
  app.quit()
})

ipcMain.on('minimize-window', () => {
  mainWindow?.minimize()
})

ipcMain.handle('lineups:load', async () => {
  try {
    const raw = await fs.readFile(customLineupsPath(), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
})

ipcMain.handle('lineups:save', async (_event, lineups: unknown) => {
  await fs.writeFile(customLineupsPath(), JSON.stringify(lineups, null, 2), 'utf-8')
  return true
})
