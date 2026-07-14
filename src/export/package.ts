import JSZip from 'jszip'
import type { ManifestRow } from './manifest'
import { makeManifestCsv } from './manifest'
import { makeFileNames } from './manifest'
import { captureFloor, cropJpeg, scaleRegions } from './render'
import type { EdmDraft, FloorInstance, MediaState } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { getDomExportRegions, getFloorExportRegions, getRegionUrl } from './regions'
import { getFloorHeight } from '../templates/floorGeometry'
import { encodeGifFrames, type RgbaFrame } from './gif'

export interface RenderedFloor { fullName: string; full: Blob; width: number; height: number; includeFull: boolean; regions: { name: string; blob: Blob }[] }
export async function composeLongPreview(floors: RenderedFloor[]) {
  const bitmaps = await Promise.all(floors.map(item => createImageBitmap(item.full))); const canvas = document.createElement('canvas'); canvas.width = 750; canvas.height = bitmaps.reduce((sum, image) => sum + image.height, 0)
  const context = canvas.getContext('2d')!; let y = 0; bitmaps.forEach(image => { context.drawImage(image, 0, y); y += image.height })
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('长图生成失败')), 'image/jpeg', .92))
}
export async function buildExportZip(floors: RenderedFloor[], rows: ManifestRow[]) {
  const zip = new JSZip(); addRenderedFloorsToZip(zip, floors)
  zip.file('full-preview.jpg', await composeLongPreview(floors)); zip.file('link-manifest.csv', makeManifestCsv(rows))
  return zip.generateAsync({ type: 'blob' })
}

export function addRenderedFloorsToZip(zip: JSZip, floors: RenderedFloor[]) {
  floors.forEach(floor => {
    if (floor.includeFull) zip.file(floor.fullName, floor.full)
    floor.regions.forEach(region => zip.file(region.name, region.blob))
  })
}

const gifBannerTemplateIds = new Set(['banner-regular', 'banner-image-copy'])
export function isAnimatedBanner(floor: FloorInstance) {
  return gifBannerTemplateIds.has(floor.templateId) && floor.animation?.enabled === true && floor.animation.frames.length >= 2
}
export function isGifImageSource(source = '') {
  return /^data:image\/gif(?:;|,)/i.test(source) || /\.gif(?:[?#].*)?$/i.test(source)
}
export function isUploadedGifBanner(floor: FloorInstance) {
  return gifBannerTemplateIds.has(floor.templateId) && !isAnimatedBanner(floor) && isGifImageSource(floor.media?.image)
}
export function getAnimatedBannerFileName(floorNumber: number) {
  return `${String(floorNumber).padStart(2, '0')}-banner-item-01.gif`
}
export function isWholeFloorRegion(region: { x: number; y: number; width: number; height: number }, floorHeight: number) {
  return region.x === 0 && region.y === 0 && region.width === 750 && region.height === floorHeight
}

async function blobToRgbaFrame(blob: Blob): Promise<RgbaFrame> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height
  const context = canvas.getContext('2d')!; context.drawImage(bitmap, 0, 0)
  return { width: canvas.width, height: canvas.height, data: context.getImageData(0, 0, canvas.width, canvas.height).data }
}

function applyFrameToNode(root: HTMLElement, frame: MediaState) {
  const holder = root.querySelector('.editable-image-frame') as HTMLElement | null
  if (!holder) throw new Error('GIF Banner 图片区域不存在')
  if (!frame.image) throw new Error('GIF 帧图片不能为空')
  let image = holder.querySelector('img')
  if (!image) { image = document.createElement('img'); image.alt = ''; holder.append(image) }
  image.crossOrigin = 'anonymous'
  image.decoding = 'sync'
  image.loading = 'eager'
  image.src = frame.image
  image.style.transform = `translate(-50%, -50%) translate(${frame.offsetX}px, ${frame.offsetY}px) scale(${frame.scale})`
}

const waitForAnimationFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
const wait = (delayMs: number) => new Promise<void>(resolve => window.setTimeout(resolve, delayMs))

async function canvasToPngDataUrl(canvas: HTMLCanvasElement) {
  return canvas.toDataURL('image/png')
}

async function decodeGifMediaFrames(media: MediaState) {
  const ImageDecoderConstructor = (globalThis as typeof globalThis & { ImageDecoder?: new (options: { data: ArrayBuffer; type: string }) => {
    tracks?: { ready?: Promise<void>; selectedTrack?: { frameCount?: number } }
    decode: (options: { frameIndex: number }) => Promise<{ image: { displayWidth?: number; displayHeight?: number; duration?: number; close?: () => void } & CanvasImageSource }>
    close?: () => void
  } }).ImageDecoder
  if (!ImageDecoderConstructor || !media.image) return null
  try {
    const blob = await fetch(media.image).then(response => response.blob())
    const decoder = new ImageDecoderConstructor({ data: await blob.arrayBuffer(), type: blob.type || 'image/gif' })
    await decoder.tracks?.ready
    const frameCount = Math.max(1, Math.min(24, Number(decoder.tracks?.selectedTrack?.frameCount) || 12))
    const frames: MediaState[] = []
    const durations: number[] = []
    for (let index = 0; index < frameCount; index++) {
      const { image } = await decoder.decode({ frameIndex: index })
      const width = Number(image.displayWidth) || Number((image as { width?: number }).width) || 1
      const height = Number(image.displayHeight) || Number((image as { height?: number }).height) || 1
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(image, 0, 0, width, height)
      frames.push({ ...media, image: await canvasToPngDataUrl(canvas) })
      if (image.duration) durations.push(Math.max(60, Math.round(image.duration / 1000)))
      image.close?.()
    }
    decoder.close?.()
    return { frames, delayMs: durations.length ? Math.round(durations.reduce((sum, item) => sum + item, 0) / durations.length) : 120 }
  } catch {
    return null
  }
}

export async function captureAnimatedBanner(node: HTMLElement, frames: MediaState[], delayMs: number, capture: typeof captureFloor = captureFloor) {
  const holder = node.querySelector('.editable-image-frame') as HTMLElement | null
  if (!holder) throw new Error('GIF Banner 图片区域不存在')
  let image = holder.querySelector('img')
  if (!image) { image = document.createElement('img'); image.alt = ''; holder.append(image) }
  const original = { src: image.getAttribute('src'), transform: image.style.transform, crossOrigin: image.crossOrigin, decoding: image.decoding, loading: image.loading }
  try {
    const captures: Blob[] = []
    for (const frame of frames) { applyFrameToNode(node, frame); await waitForAnimationFrame(); captures.push(await capture(node)) }
    const rgbaFrames = await Promise.all(captures.map(blobToRgbaFrame))
    const bytes = encodeGifFrames(rgbaFrames, delayMs)
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
    return { preview: captures[0], gif: new Blob([buffer], { type: 'image/gif' }) }
  } finally {
    if (original.src === null) image.remove()
    else {
      image.src = original.src
      image.style.transform = original.transform
      image.crossOrigin = original.crossOrigin
      image.decoding = original.decoding
      image.loading = original.loading
    }
  }
}

export async function captureUploadedGifBanner(node: HTMLElement, media: MediaState, capture: typeof captureFloor = captureFloor) {
  const decoded = await decodeGifMediaFrames(media)
  if (decoded && decoded.frames.length >= 2) return captureAnimatedBanner(node, decoded.frames, decoded.delayMs, capture)
  const captures: Blob[] = []
  for (let index = 0; index < 12; index++) { await wait(index === 0 ? 0 : 120); captures.push(await capture(node)) }
  const rgbaFrames = await Promise.all(captures.map(blobToRgbaFrame))
  const bytes = encodeGifFrames(rgbaFrames, 120)
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  return { preview: captures[0], gif: new Blob([buffer], { type: 'image/gif' }) }
}

export function getExportFloorNode(floorId: string, root: ParentNode = document) {
  return root.querySelector(`.edm-canvas [data-floor-id="${floorId}"] .floor-render`) as HTMLElement | null
    ?? root.querySelector(`[data-floor-id="${floorId}"] .floor-render`) as HTMLElement | null
}

export async function exportDraftFromDom(draft: EdmDraft) {
  const rendered: RenderedFloor[] = []; const rows: ManifestRow[] = []
  for (let index = 0; index < draft.floors.length; index++) {
    const floor = draft.floors[index], template = getTemplate(floor.templateId)?.definition
    const node = getExportFloorNode(floor.id)
    if (!template || !node) throw new Error(`楼层 ${index + 1} 无法渲染`)
    const actualHeight = node.clientHeight
    const baseRegions = getFloorExportRegions(template, floor, actualHeight)
    const exportRegions = template.domExportRegions ? getDomExportRegions(node, baseRegions) : baseRegions
    const names = makeFileNames(index + 1, template.category, exportRegions.map(region => region.id)); const scaled = scaleRegions(exportRegions)
    if (isAnimatedBanner(floor) || isUploadedGifBanner(floor)) {
      const animation = floor.animation!
      const output = isAnimatedBanner(floor)
        ? await captureAnimatedBanner(node, animation.frames, animation.intervalMs)
        : await captureUploadedGifBanner(node, floor.media!)
      const name = getAnimatedBannerFileName(index + 1)
      rows.push({ floorNumber: index + 1, floorName: template.name, fileName: name, regionName: `${template.name} GIF`, width: 750, height: actualHeight * 2, url: floor.media?.url || animation?.frames[0]?.url || '' })
      rendered.push({ fullName: names.full, full: output.preview, width: 750, height: actualHeight * 2, includeFull: false, regions: [{ name, blob: output.gif }] })
      continue
    }
    const full = await captureFloor(node)
    const floorHeight = (template.autoHeight ? actualHeight : getFloorHeight(template, floor)) * 2
    const regions = await Promise.all(scaled.map(async (region, regionIndex) => { const name = names.regions[regionIndex]; rows.push({ floorNumber: index + 1, floorName: template.name, fileName: name, regionName: region.name, width: region.width, height: region.height, url: getRegionUrl(floor, region) }); return { name, blob: isWholeFloorRegion(region, floorHeight) ? full : await cropJpeg(full, region) } }))
    rendered.push({ fullName: names.full, full, width: 750, height: floorHeight, includeFull: template.exportFullImage !== false, regions })
  }
  const zip = await buildExportZip(rendered, rows); const url = URL.createObjectURL(zip); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${draft.name || 'edm'}-export.zip`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
