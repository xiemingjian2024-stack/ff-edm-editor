import { app, BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLocalApp } from '../server/local-app.mjs'
import { createDesktopAppPaths, getDesktopWindowOptions } from './desktop-config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
let localServer
let mainWindow
const KLAVIYO_REVISION = '2026-07-15'
const normalizeKlaviyoPrivateKey = value => String(value || '').replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '')

function credentialPath() { return resolve(app.getPath('userData'), 'secure', 'klaviyo-key.json') }
async function readKlaviyoKey() {
  try {
    const stored = JSON.parse(await readFile(credentialPath(), 'utf8'))
    return safeStorage.decryptString(Buffer.from(stored.encrypted, 'base64'))
  } catch { return '' }
}
async function saveKlaviyoKey(key) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('当前系统无法启用安全存储')
  await mkdir(dirname(credentialPath()), { recursive: true })
  await writeFile(credentialPath(), JSON.stringify({ encrypted: safeStorage.encryptString(key).toString('base64') }), { mode: 0o600 })
}
async function klaviyoRequest(path, key, init = {}) {
  const response = await fetch(`https://a.klaviyo.com${path}`, { ...init, headers: { Authorization: `Klaviyo-API-Key ${key}`, accept: 'application/vnd.api+json', revision: KLAVIYO_REVISION, ...init.headers } })
  if (!response.ok) {
    let detail = ''
    try { detail = (await response.json())?.errors?.[0]?.detail ?? '' } catch {}
    if (response.status === 401 || response.status === 403) throw new Error('API Key 无效或缺少 Images 读写权限')
    throw new Error(detail || `Klaviyo 请求失败（${response.status}）`)
  }
  return response.json()
}
function registerKlaviyoHandlers() {
  ipcMain.handle('klaviyo:status', async () => { const key = await readKlaviyoKey(); return { available: safeStorage.isEncryptionAvailable(), connected: Boolean(key), suffix: key ? key.slice(-4) : '' } })
  ipcMain.handle('klaviyo:connect', async (_event, keyValue) => {
    const key = normalizeKlaviyoPrivateKey(keyValue)
    if (!key.startsWith('pk_') || key.length <= 3) throw new Error('请输入以 pk_ 开头的 Klaviyo Private API Key')
    await klaviyoRequest('/api/images?page[size]=1', key)
    await saveKlaviyoKey(key)
    return { available: true, connected: true, suffix: key.slice(-4) }
  })
  ipcMain.handle('klaviyo:disconnect', async () => { await rm(credentialPath(), { force: true }); return { available: safeStorage.isEncryptionAvailable(), connected: false, suffix: '' } })
  ipcMain.handle('klaviyo:upload-image', async (_event, payload) => {
    const key = await readKlaviyoKey()
    if (!key) throw new Error('请先连接 Klaviyo')
    const bytes = Buffer.from(payload.bytes)
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('图片超过 Klaviyo API 的 5MB 限制')
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 20)
    const extension = payload.type === 'image/png' ? 'png' : payload.type === 'image/gif' ? 'gif' : 'jpg'
    const name = `edm-editor-${hash}.${extension}`
    const filter = encodeURIComponent(`equals(name,"${name}")`)
    const existing = await klaviyoRequest(`/api/images?filter=${filter}&page[size]=1`, key)
    const existingUrl = existing?.data?.[0]?.attributes?.image_url
    if (existingUrl) return { url: existingUrl, reused: true }
    const form = new FormData()
    form.append('file', new Blob([bytes], { type: payload.type || 'image/jpeg' }), name)
    form.append('name', name)
    form.append('hidden', 'false')
    const uploaded = await klaviyoRequest('/api/image-upload', key, { method: 'POST', body: form })
    const url = uploaded?.data?.attributes?.image_url
    if (!url) throw new Error('Klaviyo 未返回图片地址')
    return { url, reused: false }
  })
}

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
  mainWindow = new BrowserWindow(getDesktopWindowOptions(resolve(__dirname, 'preload.cjs')))
  mainWindow.once('ready-to-show', () => mainWindow?.show())
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl)
    return { action: 'deny' }
  })
  await mainWindow.loadURL(url)
}

app.whenReady().then(() => { registerKlaviyoHandlers(); return createWindow() })

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  localServer?.close()
})
