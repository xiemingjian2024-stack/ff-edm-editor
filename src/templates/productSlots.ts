import type { FloorInstance, FloorTemplate } from '../domain/edm'

export function getActiveProductSlots(template: FloorTemplate, floor: FloorInstance) {
  if (!template.productSlotCountFieldId) return template.productSlots
  const requested = Number(floor.values[template.productSlotCountFieldId])
  const count = Number.isFinite(requested) ? requested : template.productSlots.length
  return template.productSlots.slice(0, Math.max(0, Math.min(template.productSlots.length, count)))
}
