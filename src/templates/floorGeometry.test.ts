import { describe, expect, it } from 'vitest'
import type { FloorInstance, FloorTemplate } from '../domain/edm'
import { getFloorHeight } from './floorGeometry'
import { getFloorExportRegions } from '../export/regions'

const base = {
  id: 'dynamic', version: 1, name: '动态楼层', category: 'banner', designWidth: 375, designHeight: 375,
  fields: [], productSlots: [], exportRegions: [{ id: 'full', name: '整层', x: 0, y: 0, width: 375, height: 375 }],
} satisfies FloorTemplate

const floor = (value: string): FloorInstance => ({ id: 'f', templateId: 'dynamic', values: { height: value }, products: {} })

describe('动态楼层高度', () => {
  it('读取字段并限制在声明范围内', () => {
    const template = { ...base, heightConfig: { fieldId: 'height', min: 250, max: 600, offset: 0 } }
    expect(getFloorHeight(template, floor('420'))).toBe(420)
    expect(getFloorHeight(template, floor('100'))).toBe(250)
    expect(getFloorHeight(template, floor('900'))).toBe(600)
  })

  it('支持图片区高度加固定文案区高度', () => {
    const template = { ...base, designHeight: 480, heightConfig: { fieldId: 'height', min: 200, max: 500, offset: 180 } } satisfies FloorTemplate
    expect(getFloorHeight(template, floor('300'))).toBe(480)
  })

  it('动态整层导出区域使用实际高度', () => {
    const template = { ...base, heightConfig: { fieldId: 'height', min: 250, max: 600, offset: 0 } } satisfies FloorTemplate
    expect(getFloorExportRegions(template, floor('420'))[0].height).toBe(420)
  })
})
