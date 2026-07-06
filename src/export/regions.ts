import type { ExportRegion, FloorInstance, FloorTemplate } from '../domain/edm'
import { getFloorHeight } from '../templates/floorGeometry'
import { getActiveProductSlots } from '../templates/productSlots'

export function getRegionUrl(floor: FloorInstance, region: ExportRegion): string {
  if (region.mediaLink) return floor.media?.url ?? ''
  return region.linkSlotId ? floor.products[region.linkSlotId]?.url ?? '' : ''
}

export function getFloorExportRegions(template: FloorTemplate, floor: FloorInstance, actualHeight?: number): ExportRegion[] {
  const config = template.navigationConfig
  if (config && template.domExportRegions) {
    const requested = Number(floor.values.navigationCount)
    const count = Math.min(config.maxItems, Math.max(config.minItems, Number.isFinite(requested) ? requested : config.minItems))
    return template.exportRegions
      .filter(region => region.navigationItemIndex === undefined || region.navigationItemIndex < count)
      .map(region => region.navigationItemIndex === undefined ? region : { ...region, name: floor.navigationItems?.[region.navigationItemIndex]?.text || `链接 ${region.navigationItemIndex + 1}` })
  }
  if (!config) {
    const floorHeight = template.autoHeight && actualHeight ? actualHeight : getFloorHeight(template, floor)
    const activeProductIds = new Set(getActiveProductSlots(template, floor).map(slot => slot.id))
    return template.exportRegions.filter(region => !template.productSlotCountFieldId || !region.linkSlotId || activeProductIds.has(region.linkSlotId)).map(region => region.y === 0 && region.height === template.designHeight ? { ...region, height: floorHeight } : region)
  }
  const requested = Number(floor.values.navigationCount)
  const count = Math.min(config.maxItems, Math.max(config.minItems, Number.isFinite(requested) ? requested : config.minItems))
  return Array.from({ length: count }, (_, index) => {
    const x = 375 * index / count
    const nextX = 375 * (index + 1) / count
    return {
      id: `navigation-${index + 1}`,
      name: floor.navigationItems?.[index]?.text || `导航项 ${index + 1}`,
      x,
      y: 0,
      width: nextX - x,
      height: template.designHeight,
    }
  })
}

export function getDomExportRegions(root: HTMLElement, regions: ExportRegion[]): ExportRegion[] {
  const rootRect = root.getBoundingClientRect()
  const entries = regions.flatMap((region, index) => {
    const node = root.querySelector<HTMLElement>(`[data-export-region-id="${region.id}"]`)
    if (!node) return []
    const rect = node.getBoundingClientRect()
    return [{ region, index, left: rect.left - rootRect.left, right: rect.right - rootRect.left, top: rect.top - rootRect.top, bottom: rect.bottom - rootRect.top }]
  })
  const groups: Array<{ top: number; bottom: number; entries: typeof entries }> = []
  ;[...entries].sort((a, b) => a.top - b.top || a.left - b.left).forEach(entry => {
    const group = groups.find(candidate => Math.abs(candidate.top - entry.top) < 2)
    if (group) { group.entries.push(entry); group.bottom = Math.max(group.bottom, entry.bottom) }
    else groups.push({ top: entry.top, bottom: entry.bottom, entries: [entry] })
  })
  const tiled = new Map<number, ExportRegion>()
  groups.forEach((group, groupIndex) => {
    const previous = groups[groupIndex - 1], next = groups[groupIndex + 1]
    const y = previous ? (previous.bottom + group.top) / 2 : 0
    const bottom = next ? (group.bottom + next.top) / 2 : rootRect.height
    const row = group.entries.sort((a, b) => a.left - b.left)
    row.forEach((entry, columnIndex) => {
      const previousEntry = row[columnIndex - 1], nextEntry = row[columnIndex + 1]
      const x = previousEntry ? (previousEntry.right + entry.left) / 2 : 0
      const right = nextEntry ? (entry.right + nextEntry.left) / 2 : rootRect.width
      tiled.set(entry.index, { ...entry.region, x, y, width: right - x, height: bottom - y })
    })
  })
  return regions.flatMap((_, index) => tiled.get(index) ?? [])
}
