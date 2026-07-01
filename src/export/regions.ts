import type { ExportRegion, FloorInstance, FloorTemplate } from '../domain/edm'

export function getRegionUrl(floor: FloorInstance, region: ExportRegion): string {
  if (region.navigationItemIndex !== undefined) return floor.navigationItems?.[region.navigationItemIndex]?.url ?? ''
  return region.linkSlotId ? floor.products[region.linkSlotId]?.url ?? '' : ''
}

export function getFloorExportRegions(template: FloorTemplate, floor: FloorInstance): ExportRegion[] {
  const config = template.navigationConfig
  if (!config) return template.exportRegions
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
