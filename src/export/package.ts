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
export function getAnimatedBannerFileName(floorNumber: number) {
  return `${String(floorNumber).padStart(2, '0')}-banner-item-01.gif`
}

async function blobToRgbaFrame(blob: Blob): Promise<RgbaFrame> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height
  const context = canvas.getContext('2d')!; context.drawImage(bitmap, 0, 0)
  return { width: canvas.width, height: canvas.height, data: context.getImageData(0, 0, canvas.width, canvas.height).data }
}

function applyFrameToClone(root: HTMLElement, frame: MediaState) {
  const holder = root.querySelector('.editable-image-frame') as HTMLElement | null
  if (!holder) throw new Error('GIF Banner 图片区域不存在')
  let image = holder.querySelector('img')
  if (!image) { image = document.createElement('img'); image.alt = ''; holder.append(image) }
  image.src = frame.image
  image.style.transform = `translate(-50%, -50%) translate(${frame.offsetX}px, ${frame.offsetY}px) scale(${frame.scale})`
}

async function captureAnimatedBanner(node: HTMLElement, frames: MediaState[], delayMs: number) {
  const clone = node.cloneNode(true) as HTMLElement
  Object.assign(clone.style, { position: 'fixed', left: '-10000px', top: '0', width: '375px', pointerEvents: 'none' })
  document.body.append(clone)
  try {
    const captures: Blob[] = []
    for (const frame of frames) { applyFrameToClone(clone, frame); captures.push(await captureFloor(clone)) }
    const rgbaFrames = await Promise.all(captures.map(blobToRgbaFrame))
    const bytes = encodeGifFrames(rgbaFrames, delayMs)
    return { preview: captures[0], gif: new Blob([new Uint8Array(bytes).buffer], { type: 'image/gif' }) }
  } finally { clone.remove() }
}

export async function exportDraftFromDom(draft: EdmDraft) {
  const rendered: RenderedFloor[] = []; const rows: ManifestRow[] = []
  for (let index = 0; index < draft.floors.length; index++) {
    const floor = draft.floors[index], template = getTemplate(floor.templateId)?.definition
    const node = document.querySelector(`[data-floor-id="${floor.id}"] .floor-render`) as HTMLElement | null
    if (!template || !node) throw new Error(`楼层 ${index + 1} 无法渲染`)
    const actualHeight = node.clientHeight
    const baseRegions = getFloorExportRegions(template, floor, actualHeight)
    const exportRegions = template.domExportRegions ? getDomExportRegions(node, baseRegions) : baseRegions
    const names = makeFileNames(index + 1, template.category, exportRegions.map(region => region.id)); const scaled = scaleRegions(exportRegions)
    if (isAnimatedBanner(floor)) {
      const animation = floor.animation!
      const output = await captureAnimatedBanner(node, animation.frames, animation.intervalMs)
      const name = getAnimatedBannerFileName(index + 1)
      rows.push({ floorNumber: index + 1, floorName: template.name, fileName: name, regionName: `${template.name} GIF`, width: 750, height: actualHeight * 2, url: floor.media?.url || animation.frames[0]?.url || '' })
      rendered.push({ fullName: names.full, full: output.preview, width: 750, height: actualHeight * 2, includeFull: false, regions: [{ name, blob: output.gif }] })
      continue
    }
    const full = await captureFloor(node)
    const regions = await Promise.all(scaled.map(async (region, regionIndex) => { const name = names.regions[regionIndex]; rows.push({ floorNumber: index + 1, floorName: template.name, fileName: name, regionName: region.name, width: region.width, height: region.height, url: getRegionUrl(floor, region) }); return { name, blob: await cropJpeg(full, region) } }))
    rendered.push({ fullName: names.full, full, width: 750, height: (template.autoHeight ? actualHeight : getFloorHeight(template, floor)) * 2, includeFull: template.exportFullImage !== false, regions })
  }
  const zip = await buildExportZip(rendered, rows); const url = URL.createObjectURL(zip); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${draft.name || 'edm'}-export.zip`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
