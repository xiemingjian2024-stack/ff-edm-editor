import { app, BrowserWindow, shell } from 'electron'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLocalApp } from '../server/local-app.mjs'
import { createDesktopAppPaths, getDesktopWindowOptions } from './desktop-config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
let localServer
let mainWindow

function getAppRoot() {
  return app.isPackaged ? app.getAppPath() : resolve(__dirname, '..')
}

function listen(appInstance, preferredPort) {
  return new Promise((resolveListen, rejectListen) => {
    const server = appInstance.listen(preferredPort, '127.0.0.1')
    server.once('listening', () => resolveListen({ server, port: preferredPort }))
    server.once('error', error => {
      if (error.code === 'EADDRINUSE') resolveListen(listen(appInstance, preferredPort + 1))
      else rejectListen(error)
    })
  })
}

async function startServer() {
  const paths = createDesktopAppPaths(getAppRoot())
  const appInstance = createLocalApp({ distDir: paths.distDir })
  const result = await listen(appInstance, 5174)
  localServer = result.server
  return `http://127.0.0.1:${result.port}/`
}

async function createWindow() {
  const url = await startServer()
  mainWindow = new BrowserWindow(getDesktopWindowOptions())
  mainWindow.once('ready-to-show', () => mainWindow?.show())
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl)
    return { action: 'deny' }
  })
  await mainWindow.loadURL(url)
}

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  localServer?.close()
})
