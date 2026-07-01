import { describe, expect, it } from 'vitest'
import type { FloorInstance, FloorTemplate } from '../domain/edm'
import { getFloorExportRegions } from './regions'
import { scaleRegions } from './render'

const template = {
  id: 'head-category-navigation', version: 1, name: '分类导航', category: 'head', designWidth: 375, designHeight: 46,
  fields: [{ id: 'navigationCount', type: 'choice', label: '导航数量', defaultValue: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] }],
  productSlots: [], exportRegions: [], exportFullImage: false,
  navigationConfig: { minItems: 2, maxItems: 4, defaultItems: [{ text: 'Home', url: '' }, { text: 'Travel', url: '' }, { text: 'Covers', url: '' }, { text: '', url: '' }] },
} satisfies FloorTemplate

function floor(count: number): FloorInstance {
  return { id: 'floor-1', templateId: template.id, values: { navigationCount: String(count) }, products: {}, navigationItems: template.navigationConfig.defaultItems }
}

describe.each([2, 3, 4])('%s 项导航区域', count => {
  it('生成对应数量且 2 倍宽度无缝覆盖 750px', () => {
    const regions = scaleRegions(getFloorExportRegions(template, floor(count)))
    expect(regions).toHaveLength(count)
    expect(regions[0].x).toBe(0)
    expect(regions.at(-1)!.x + regions.at(-1)!.width).toBe(750)
    regions.slice(1).forEach((region, index) => expect(region.x).toBe(regions[index].x + regions[index].width))
  })
})

it('导航区域关联到对应导航项', () => {
  expect(getFloorExportRegions(template, floor(3)).map(item => item.navigationItemIndex)).toEqual([0, 1, 2])
})
