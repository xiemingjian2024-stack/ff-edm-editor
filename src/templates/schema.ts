import { z } from 'zod'
import type { FloorTemplate } from '../domain/edm'

const field = z.discriminatedUnion('type', [
  z.object({ id: z.string().min(1), type: z.literal('text'), label: z.string(), defaultValue: z.string() }),
  z.object({ id: z.string().min(1), type: z.literal('color'), label: z.string(), defaultValue: z.string() }),
  z.object({ id: z.string().min(1), type: z.literal('image'), label: z.string(), defaultValue: z.string() }),
  z.object({ id: z.string().min(1), type: z.literal('choice'), label: z.string(), defaultValue: z.string(), options: z.array(z.object({ label: z.string(), value: z.string() })).min(1) }),
  z.object({ id: z.string().min(1), type: z.literal('range'), label: z.string(), defaultValue: z.string(), min: z.number(), max: z.number(), step: z.number().positive(), unit: z.string().optional() })
])
const schema = z.object({
  id: z.string().min(1), version: z.number().int().positive(), name: z.string().min(1),
  category: z.enum(['head', 'banner', 'title', 'information', 'product-card', 'content', 'promotion', 'footer']),
  designWidth: z.literal(375), designHeight: z.number().positive(), fields: z.array(field),
  themeColorFields: z.array(z.object({ fieldId: z.string().min(1), defaultSlot: z.string().min(1) })).optional(),
  navigationConfig: z.object({ minItems: z.number().int().positive(), maxItems: z.number().int().positive(), defaultItems: z.array(z.object({ text: z.string(), url: z.string() })) }).optional(),
  exportFullImage: z.boolean().optional(),
  mediaConfig: z.object({ frameHeightFieldId: z.string().optional(), fixedFrameHeight: z.number().positive().optional() }).optional(),
  mediaSlots: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(1).optional(),
  mediaSlotCountFieldId: z.string().min(1).optional(),
  heightConfig: z.object({ fieldId: z.string().min(1), min: z.number().positive(), max: z.number().positive(), offset: z.number().nonnegative() }).optional(),
  autoHeight: z.boolean().optional(),
  hiddenInLibrary: z.boolean().optional(),
  productSlots: z.array(z.object({ id: z.string().min(1), label: z.string() })),
  exportRegions: z.array(z.object({ id: z.string(), name: z.string(), x: z.number().nonnegative(), y: z.number().nonnegative(), width: z.number().positive(), height: z.number().positive(), linkSlotId: z.string().optional(), navigationItemIndex: z.number().int().nonnegative().optional(), mediaLink: z.boolean().optional() }))
})

export function parseTemplate(input: unknown): FloorTemplate {
  const value = schema.parse(input)
  const unique = (items: string[]) => new Set(items).size === items.length
  if (!unique(value.fields.map(item => item.id))) throw new Error('字段 ID 不能重复')
  if (!unique(value.productSlots.map(item => item.id))) throw new Error('商品槽位 ID 不能重复')
  if (value.mediaSlots && !unique(value.mediaSlots.map(item => item.id))) throw new Error('媒体槽位 ID 不能重复')
  if (value.mediaSlotCountFieldId && !value.fields.some(item => item.id === value.mediaSlotCountFieldId && item.type === 'choice')) throw new Error('媒体数量字段必须是选项字段')
  if (value.navigationConfig && (value.navigationConfig.minItems > value.navigationConfig.maxItems || value.navigationConfig.defaultItems.length < value.navigationConfig.maxItems)) throw new Error('导航项配置无效')
  if (value.heightConfig && !value.fields.some(item => item.id === value.heightConfig?.fieldId && item.type === 'range')) throw new Error('动态高度字段必须是范围字段')
  const slots = new Set(value.productSlots.map(item => item.id))
  const colorFields = new Set(value.fields.filter(item => item.type === 'color').map(item => item.id))
  for (const themedField of value.themeColorFields ?? []) {
    if (!colorFields.has(themedField.fieldId)) throw new Error(`主题色位只能关联颜色字段：${themedField.fieldId}`)
  }
  for (const region of value.exportRegions) {
    if (region.x + region.width > 375 || region.y + region.height > value.designHeight) throw new Error(`导出区域 ${region.id} 超出楼层边界`)
    if (region.linkSlotId && !slots.has(region.linkSlotId)) throw new Error(`导出区域 linkSlotId ${region.linkSlotId} 不存在`)
  }
  return value
}
