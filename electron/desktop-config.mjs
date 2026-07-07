import { join } from 'node:path'

export function createDesktopAppPaths(appRoot) {
  return {
    appRoot,
    distDir: join(appRoot, 'dist'),
  }
}

export function getDesktopWindowOptions() {
  return {
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#F4F6FA',
    title: 'EDM EDITOR',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  }
}
