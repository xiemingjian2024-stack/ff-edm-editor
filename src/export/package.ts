import JSZip from 'jszip'
import type { ManifestRow } from './manifest'
import { makeManifestCsv } from './manifest'
import { makeFileNames } from './manifest'
import { captureFloor, cropJpeg, scaleRegions } from './render'
import type { EdmDraft } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { getFloorExportRegions, getRegionUrl } from './regions'
import { getFloorHeight } from '../templates/floorGeometry'

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

export async function exportDraftFromDom(draft: EdmDraft) {
  const rendered: RenderedFloor[] = []; const rows: ManifestRow[] = []
  for (let index = 0; index < draft.floors.length; index++) {
    const floor = draft.floors[index], template = getTemplate(floor.templateId)?.definition
    const node = document.querySelector(`[data-floor-id="${floor.id}"] .floor-render`) as HTMLElement | null
    if (!template || !node) throw new Error(`楼层 ${index + 1} 无法渲染`)
    const actualHeight = node.clientHeight
    const exportRegions = getFloorExportRegions(template, floor, actualHeight)
    const full = await captureFloor(node); const names = makeFileNames(index + 1, template.category, exportRegions.map(region => region.id)); const scaled = scaleRegions(exportRegions)
    const regions = await Promise.all(scaled.map(async (region, regionIndex) => { const name = names.regions[regionIndex]; rows.push({ floorNumber: index + 1, floorName: template.name, fileName: name, regionName: region.name, width: region.width, height: region.height, url: getRegionUrl(floor, region) }); return { name, blob: await cropJpeg(full, region) } }))
    rendered.push({ fullName: names.full, full, width: 750, height: (template.autoHeight ? actualHeight : getFloorHeight(template, floor)) * 2, includeFull: template.exportFullImage !== false, regions })
  }
  const zip = await buildExportZip(rendered, rows); const url = URL.createObjectURL(zip); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${draft.name || 'edm'}-export.zip`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
