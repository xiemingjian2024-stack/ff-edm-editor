import type { ExportRegion, FloorInstance, FloorTemplate } from '../domain/edm'
import { getFloorHeight } from '../templates/floorGeometry'

export function getRegionUrl(floor: FloorInstance, region: ExportRegion): string {
  if (region.navigationItemIndex !== undefined) return floor.navigationItems?.[region.navigationItemIndex]?.url ?? ''
  if (region.mediaLink) return floor.media?.url ?? ''
  return region.linkSlotId ? floor.products[region.linkSlotId]?.url ?? '' : ''
}

export function getFloorExportRegions(template: FloorTemplate, floor: FloorInstance): ExportRegion[] {
  const config = template.navigationConfig
  if (!config) {
    const actualHeight = getFloorHeight(template, floor)
    return template.exportRegions.map(region => region.y === 0 && region.height === template.designHeight ? { ...region, height: actualHeight } : region)
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
      navigationItemIndex: index,
    }
  })
}
