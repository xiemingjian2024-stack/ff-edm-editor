import JSZip from 'jszip'
import type { EdmDraft, ThemePalette } from '../domain/edm'

const prefix = 'FFEDM1-'
const classicPaletteId = 'funnyfuzzy-classic'

export interface DesignTransferPayload {
  version: 1
  draft: EdmDraft
  palette?: ThemePalette
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function assertPayload(value: unknown): asserts value is DesignTransferPayload {
  const payload = value as Partial<DesignTransferPayload>
  if (!payload || payload.version !== 1 || !payload.draft || typeof payload.draft.name !== 'string' || !Array.isArray(payload.draft.floors)) {
    throw new Error('设计稿编码内容异常')
  }
}

export async function createTransferCode(draft: EdmDraft, palettes: ThemePalette[]) {
  const palette = draft.themePaletteId === classicPaletteId ? undefined : palettes.find(item => item.id === draft.themePaletteId)
  const payload: DesignTransferPayload = { version: 1, draft: structuredClone(draft), palette: palette ? structuredClone(palette) : undefined }
  const zip = new JSZip()
  zip.file('design.json', JSON.stringify(payload))
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  return `${prefix}${bytesToBase64Url(bytes)}`
}

export async function parseTransferCode(code: string) {
  const trimmed = code.trim()
  if (!trimmed.startsWith(prefix)) throw new Error('无法识别的设计稿编码')
  const zip = await JSZip.loadAsync(base64UrlToBytes(trimmed.slice(prefix.length)))
  const file = zip.file('design.json')
  if (!file) throw new Error('设计稿编码内容异常')
  const payload = JSON.parse(await file.async('string')) as unknown
  assertPayload(payload)
  return payload
}

export function createTransferFileName(name: string) {
  const safe = name.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').slice(0, 120).trim()
  return `${safe || 'EDM-DESIGN'}.edm`
}
