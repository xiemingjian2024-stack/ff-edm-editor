import { describe, expect, it } from 'vitest'
import { createDesktopAppPaths, getDesktopWindowOptions } from './desktop-config.mjs'

describe('desktop app config', () => {
  it('uses the packaged app root to locate dist assets', () => {
    expect(createDesktopAppPaths('/Applications/EDM EDITOR/resources/app')).toEqual({
      appRoot: '/Applications/EDM EDITOR/resources/app',
      distDir: '/Applications/EDM EDITOR/resources/app/dist',
    })
  })

  it('keeps the renderer isolated from Node.js APIs', () => {
    expect(getDesktopWindowOptions().webPreferences).toMatchObject({
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    })
  })
})
