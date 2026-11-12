export interface KlaviyoStatus { available: boolean; connected: boolean; suffix: string }
export interface KlaviyoUploadResult { url: string; reused: boolean }

interface KlaviyoBridge {
  status: () => Promise<KlaviyoStatus>
  connect: (key: string) => Promise<KlaviyoStatus>
  disconnect: () => Promise<KlaviyoStatus>
  uploadImage: (payload: { bytes: Uint8Array; type: string }) => Promise<KlaviyoUploadResult>
}

declare global { interface Window { edmDesktop?: { klaviyo?: KlaviyoBridge } } }

const unavailable: KlaviyoStatus = { available: false, connected: false, suffix: '' }
const canUseLocalService = () => import.meta.env.MODE !== 'test'
  && ['127.0.0.1', 'localhost'].includes(window.location.hostname)
  && Boolean(window.location.port)
async function localRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { 'x-edm-editor': '1', ...init?.headers } })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || '本机服务请求失败')
  return result
}
export const getKlaviyoStatus = () => window.edmDesktop?.klaviyo?.status() ?? (canUseLocalService() ? localRequest<KlaviyoStatus>('/api/klaviyo/status') : Promise.resolve(unavailable))
export const connectKlaviyo = (key: string) => {
  const bridge = window.edmDesktop?.klaviyo
  if (bridge) return bridge.connect(key)
  if (canUseLocalService()) return localRequest<KlaviyoStatus>('/api/klaviyo/connect', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key }) })
  return Promise.reject(new Error('请通过 EDM EDITOR 本机地址连接 Klaviyo'))
}
export const disconnectKlaviyo = () => window.edmDesktop?.klaviyo?.disconnect() ?? (canUseLocalService() ? localRequest<KlaviyoStatus>('/api/klaviyo/disconnect', { method: 'POST' }) : Promise.resolve(unavailable))
export async function uploadKlaviyoImage(blob: Blob) {
  const bridge = window.edmDesktop?.klaviyo
  if (bridge) return bridge.uploadImage({ bytes: new Uint8Array(await blob.arrayBuffer()), type: blob.type || 'image/jpeg' })
  if (canUseLocalService()) return localRequest<KlaviyoUploadResult>('/api/klaviyo/image', { method: 'POST', headers: { 'content-type': blob.type || 'image/jpeg' }, body: blob })
  throw new Error('请通过 EDM EDITOR 本机地址连接 Klaviyo')
}
