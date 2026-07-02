import type { FloorInstance, FloorTemplate } from '../domain/edm'

export function getFloorHeight(template: FloorTemplate, floor: FloorInstance): number {
  const config = template.heightConfig
  if (!config) return template.designHeight
  const requested = Number(floor.values[config.fieldId])
  const value = Number.isFinite(requested) ? requested : config.min
  return Math.min(config.max, Math.max(config.min, value)) + config.offset
}
