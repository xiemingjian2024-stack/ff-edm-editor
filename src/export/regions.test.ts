import { describe, expect, it } from 'vitest'
import type { FloorInstance, FloorTemplate } from '../domain/edm'
import { getFloorExportRegions, getRegionUrl } from './regions'
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

it('导航区域读取对应链接字符串且允许为空', () => {
  const current = floor(3)
  current.navigationItems![1].url = '任意链接字符'
  const regions = getFloorExportRegions(template, current)
  expect(regions.map(region => getRegionUrl(current, region))).toEqual(['', '任意链接字符', ''])
})

it('Banner 导出区域读取图片关联的 Shopify 链接', () => {
  const current: FloorInstance = {
    id: 'banner-1', templateId: 'banner-regular', values: {}, products: {},
    media: { image: 'product.jpg', url: 'https://shop.example/products/bed', scale: 1, offsetX: 0, offsetY: 0 },
  }
  expect(getRegionUrl(current, { id: 'full', name: 'Banner', x: 0, y: 0, width: 375, height: 375, mediaLink: true })).toBe('https://shop.example/products/bed')
})

it('手动上传的 Banner 图片允许导出空链接', () => {
  const current: FloorInstance = {
    id: 'banner-1', templateId: 'banner-regular', values: {}, products: {},
    media: { image: 'blob:manual-image', url: '', scale: 1, offsetX: 0, offsetY: 0 },
  }
  expect(getRegionUrl(current, { id: 'full', name: 'Banner', x: 0, y: 0, width: 375, height: 375, mediaLink: true })).toBe('')
})
