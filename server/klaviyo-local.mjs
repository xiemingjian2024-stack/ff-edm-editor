import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { userInfo } from 'node:os'

const execFileAsync = promisify(execFile)
const revision = '2026-07-15'
const service = 'com.funnyfuzzy.edm-editor.klaviyo'
const account = userInfo().username

export const normalizeKlaviyoPrivateKey = value => String(value || '').replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '')

async function readKey() {
  if (process.platform !== 'darwin') return ''
  try { return (await execFileAsync('security', ['find-generic-password', '-a', account, '-s', service, '-w'])).stdout.trim() }
  catch { return '' }
}

async function saveKey(key) {
  if (process.platform !== 'darwin') throw new Error('浏览器连接目前仅支持 macOS；Windows 请使用桌面安装包')
  await execFileAsync('security', ['add-generic-password', '-a', account, '-s', service, '-w', key, '-U'])
}

async function deleteKey() {
  if (process.platform !== 'darwin') return
  try { await execFileAsync('security', ['delete-generic-password', '-a', account, '-s', service]) } catch {}
}

async function request(path, key, init = {}) {
  const response = await fetch(`https://a.klaviyo.com${path}`, { ...init, headers: { Authorization: `Klaviyo-API-Key ${key}`, accept: 'application/vnd.api+json', revision, ...init.headers } })
  if (!response.ok) {
    let detail = ''
    try { detail = (await response.json())?.errors?.[0]?.detail ?? '' } catch {}
    if (response.status === 401 || response.status === 403) throw new Error('API Key 无效或缺少 Images 读写权限')
    throw new Error(detail || `Klaviyo 请求失败（${response.status}）`)
  }
  return response.json()
}

export function createLocalKlaviyoService() {
  return {
    async status() { const key = await readKey(); return { available: process.platform === 'darwin', connected: Boolean(key), suffix: key ? key.slice(-4) : '' } },
    async connect(value) {
      const key = normalizeKlaviyoPrivateKey(value)
      if (!key.startsWith('pk_') || key.length <= 3) throw new Error('请输入以 pk_ 开头的 Klaviyo Private API Key')
      await request('/api/images?page[size]=1', key)
      await saveKey(key)
      return { available: true, connected: true, suffix: key.slice(-4) }
    },
    async disconnect() { await deleteKey(); return { available: process.platform === 'darwin', connected: false, suffix: '' } },
    async upload(bytes, type = 'image/jpeg') {
      const key = await readKey()
      if (!key) throw new Error('请先连接 Klaviyo')
      if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('图片超过 Klaviyo API 的 5MB 限制')
      const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 20)
      const extension = type === 'image/png' ? 'png' : type === 'image/gif' ? 'gif' : 'jpg'
      const name = `edm-editor-${hash}.${extension}`
      const filter = encodeURIComponent(`equals(name,"${name}")`)
      const existing = await request(`/api/images?filter=${filter}&page[size]=1`, key)
      const existingUrl = existing?.data?.[0]?.attributes?.image_url
      if (existingUrl) return { url: existingUrl, reused: true }
      const form = new FormData()
      form.append('file', new Blob([bytes], { type }), name)
      form.append('name', name)
      form.append('hidden', 'false')
      const uploaded = await request('/api/image-upload', key, { method: 'POST', body: form })
      const url = uploaded?.data?.attributes?.image_url
      if (!url) throw new Error('Klaviyo 未返回图片地址')
      return { url, reused: false }
    },
  }
}
