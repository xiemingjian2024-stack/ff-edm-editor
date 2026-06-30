import type { EdmDraft } from '../domain/edm'
import { getTemplate } from '../templates/registry'

export interface ExportIssue { floorId: string; floorNumber: number; message: string }
export function validateDraft(draft: EdmDraft) {
  const blockers: ExportIssue[] = [], warnings: ExportIssue[] = []
  draft.floors.forEach((floor, index) => { const template = getTemplate(floor.templateId)?.definition; if (!template) return blockers.push({ floorId: floor.id, floorNumber: index + 1, message: '模板不存在' })
    template.fields.filter(field => field.type === 'image' && !floor.values[field.id]).forEach(() => blockers.push({ floorId: floor.id, floorNumber: index + 1, message: '必填图片尚未设置' }))
    template.productSlots.forEach(slot => { const product = floor.products[slot.id]; if (!product?.url) warnings.push({ floorId: floor.id, floorNumber: index + 1, message: `${slot.label} 缺少商品链接` }); if (!product?.image) warnings.push({ floorId: floor.id, floorNumber: index + 1, message: `${slot.label} 缺少商品图片` }) })
  })
  return { blockers, warnings }
}
