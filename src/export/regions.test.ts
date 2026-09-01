import { describe, expect, it } from 'vitest'
import type { FloorInstance, FloorTemplate } from '../domain/edm'
import { getDomExportRegions, getFloorExportRegions, getRegionUrl } from './regions'
import { scaleRegions } from './render'
import { getTemplate } from '../templates/registry'

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

it('导航区域不关联链接', () => {
  expect(getFloorExportRegions(template, floor(3)).map(item => item.navigationItemIndex)).toEqual([undefined, undefined, undefined])
})

it('导航区域忽略旧数据中的链接字符串', () => {
  const current = floor(3)
  current.navigationItems![1].url = '任意链接字符'
  const regions = getFloorExportRegions(template, current)
  expect(regions.map(region => getRegionUrl(current, region))).toEqual(['', '', ''])
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

it('内容自适应模板按实际 DOM 高度生成完整导出区域', () => {
  const adaptive = getTemplate('title-centered')!.definition
  const current: FloorInstance = { id: 'title-1', templateId: adaptive.id, values: {}, products: {} }
  expect(getFloorExportRegions(adaptive, current, 224)[0]).toMatchObject({ width: 375, height: 224 })
})

it('按商品数量截取链接区域并把 DOM 间距分配给相邻切片', () => {
  const adaptive = getTemplate('product-grid-n-by-2')!.definition
  const current: FloorInstance = { id: 'products', templateId: adaptive.id, values: { productCount: '2' }, products: {} }
  const regions = getFloorExportRegions(adaptive, current, 600)
  expect(regions.map(region => region.id)).toEqual(['header', 'item-1', 'item-2', 'button'])
  const root = document.createElement('section')
  const header = document.createElement('header'); header.dataset.exportRegionId = 'header'
  const card = document.createElement('article'); card.dataset.exportRegionId = 'item-1'
  const card2 = document.createElement('article'); card2.dataset.exportRegionId = 'item-2'
  const button = document.createElement('div'); button.dataset.exportRegionId = 'button'
  root.append(header, card, card2, button)
  root.getBoundingClientRect = () => ({ x: 100, y: 50, left: 100, top: 50, right: 475, bottom: 650, width: 375, height: 600, toJSON() {} })
  header.getBoundingClientRect = () => ({ x: 100, y: 50, left: 100, top: 50, right: 475, bottom: 150, width: 375, height: 100, toJSON() {} })
  card.getBoundingClientRect = () => ({ x: 112, y: 180, left: 112, top: 180, right: 287, bottom: 460, width: 175, height: 280, toJSON() {} })
  card2.getBoundingClientRect = () => ({ x: 300, y: 180, left: 300, top: 180, right: 475, bottom: 460, width: 175, height: 280, toJSON() {} })
  button.getBoundingClientRect = () => ({ x: 190, y: 500, left: 190, top: 500, right: 385, bottom: 550, width: 195, height: 50, toJSON() {} })
  const tiled = getDomExportRegions(root, regions)
  expect(tiled).toEqual([
    expect.objectContaining({ id: 'header', x: 0, y: 0, width: 375, height: 115 }),
    expect.objectContaining({ id: 'item-1', x: 0, y: 115, width: 193.5, height: 315 }),
    expect.objectContaining({ id: 'item-2', x: 193.5, y: 115, width: 181.5, height: 315 }),
    expect.objectContaining({ id: 'button', x: 0, y: 430, width: 375, height: 170 }),
  ])
})

it('商品卡切图忽略编辑器画布 120% 预览缩放', () => {
  const regions = ['header', 'item-1', 'item-2', 'button'].map(id => ({ id, name: id, x: 0, y: 0, width: 1, height: 1 }))
  const root = document.createElement('section')
  Object.defineProperties(root, {
    clientWidth: { value: 375 },
    clientHeight: { value: 600 },
  })
  root.getBoundingClientRect = () => ({ x: 100, y: 50, left: 100, top: 50, right: 550, bottom: 770, width: 450, height: 720, toJSON() {} })
  const logicalRects = [[0, 0, 375, 100], [12, 130, 175, 280], [200, 130, 175, 280], [90, 450, 195, 50]]
  regions.forEach((region, index) => {
    const node = document.createElement('div')
    node.dataset.exportRegionId = region.id
    const [left, top, width, height] = logicalRects[index]
    node.getBoundingClientRect = () => ({
      x: 100 + left * 1.2,
      y: 50 + top * 1.2,
      left: 100 + left * 1.2,
      top: 50 + top * 1.2,
      right: 100 + (left + width) * 1.2,
      bottom: 50 + (top + height) * 1.2,
      width: width * 1.2,
      height: height * 1.2,
      toJSON() {},
    })
    root.append(node)
  })
  const tiled = getDomExportRegions(root, regions)
  expect(tiled).toEqual([
    expect.objectContaining({ id: 'header', x: 0, y: 0, width: 375, height: 115 }),
    expect.objectContaining({ id: 'item-1', x: 0, y: 115, width: 193.5, height: 315 }),
    expect.objectContaining({ id: 'item-2', x: 193.5, y: 115, width: 181.5, height: 315 }),
    expect.objectContaining({ id: 'button', x: 0, y: 430, width: 375, height: 170 }),
  ])
})

it('N×1 每张商品卡切片都覆盖整行宽度并保留上下间距', () => {
  const regions = ['header', 'item-1', 'item-2', 'button'].map(id => ({ id, name: id, x: 0, y: 0, width: 1, height: 1 }))
  const root = document.createElement('section'); root.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 375, bottom: 500, width: 375, height: 500, toJSON() {} })
  const rects = [[0, 0, 375, 100], [0, 112, 363, 160], [12, 284, 363, 160], [96, 464, 183, 30]]
  regions.forEach((region, index) => { const node = document.createElement('div'); node.dataset.exportRegionId = region.id; const [left, top, width, height] = rects[index]; node.getBoundingClientRect = () => ({ x: left, y: top, left, top, right: left + width, bottom: top + height, width, height, toJSON() {} }); root.append(node) })
  const tiled = getDomExportRegions(root, regions)
  expect(tiled.map(region => [region.x, region.width])).toEqual([[0, 375], [0, 375], [0, 375], [0, 375]])
  expect(tiled[0].height + tiled[1].height + tiled[2].height + tiled[3].height).toBe(500)
})

it('N×1 商品卡只导出当前商品并关联各自 Shopify 链接', () => {
  const adaptive = getTemplate('product-list-n-by-1')!.definition
  const current: FloorInstance = {
    id: 'product-list', templateId: adaptive.id, values: { productCount: '3' },
    products: {
      'product-1': { image: 'one.png', title: 'One', price: '£10', url: '/products/one' },
      'product-2': { image: 'two.png', title: 'Two', price: '£20', url: '/products/two' },
      'product-3': { image: 'three.png', title: 'Three', price: '£30', url: '/products/three' },
    },
  }
  const regions = getFloorExportRegions(adaptive, current)
  expect(regions.map(region => region.id)).toEqual(['header', 'item-1', 'item-2', 'item-3', 'button'])
  expect(regions.filter(region => region.linkSlotId).map(region => region.linkSlotId)).toEqual(['product-1', 'product-2', 'product-3'])
  expect(regions.filter(region => region.linkSlotId).map(region => getRegionUrl(current, region))).toEqual(['/products/one', '/products/two', '/products/three'])
})

it('产品介绍卡按当前数量导出标题、各商品卡和底部按钮', () => {
  const adaptive = getTemplate('product-introduction-cards')!.definition
  const current: FloorInstance = {
    id: 'product-introduction', templateId: adaptive.id, values: { productCount: '3' },
    products: Object.fromEntries([1, 2, 3].map(index => [`product-${index}`, { image: `${index}.png`, title: `${index}`, description: `介绍 ${index}`, price: '', url: `/product-${index}` }])),
  }
  const regions = getFloorExportRegions(adaptive, current)
  expect(regions.map(region => region.id)).toEqual(['header', 'item-1', 'item-2', 'item-3', 'button'])
  expect(regions.filter(region => region.linkSlotId).map(region => getRegionUrl(current, region))).toEqual(['/product-1', '/product-2', '/product-3'])
})

it('CODE 模板跳过中间占位且两个导出区域都没有链接', () => {
  const code = getTemplate('code-information')!.definition
  const current: FloorInstance = { id: 'code', templateId: code.id, values: {}, products: {} }
  const regions = getFloorExportRegions(code, current)
  expect(regions).toEqual([
    { id: 'top', name: 'CODE 顶部', x: 0, y: 0, width: 375, height: 60 },
    { id: 'bottom', name: 'CODE 底部', x: 0, y: 116, width: 375, height: 84 },
  ])
  expect(regions.map(region => getRegionUrl(current, region))).toEqual(['', ''])
})

it('N×3 商品卡导出标题、三张商品卡和底部按钮并关联各自链接', () => {
  const template = getTemplate('product-grid-n-by-3')!.definition
  const current: FloorInstance = {
    id: 'n3', templateId: template.id, values: {},
    products: Object.fromEntries([1, 2, 3].map(index => [`product-${index}`, { image: `${index}.png`, title: `${index}`, price: '', url: `/product-${index}` }])),
  }
  const regions = getFloorExportRegions(template, current)
  expect(regions.map(region => region.id)).toEqual(['header', 'item-1', 'item-2', 'item-3', 'button'])
  expect(regions.filter(region => region.linkSlotId).map(region => getRegionUrl(current, region))).toEqual(['/product-1', '/product-2', '/product-3'])
})

it('N×3 商品卡 DOM 切图时三张商品卡固定为 375 三等分', () => {
  const regions = ['header', 'item-1', 'item-2', 'item-3', 'button'].map(id => ({ id, name: id, x: 0, y: 0, width: 1, height: 1 }))
  const root = document.createElement('section')
  root.className = 'product-grid-n-by-3'
  root.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 375, bottom: 520, width: 375, height: 520, toJSON() {} })
  const rects = [[0, 0, 375, 130], [6, 160, 117, 260], [129, 160, 117, 260], [252, 160, 117, 260], [96, 456, 183, 34]]
  regions.forEach((region, index) => {
    const node = document.createElement('div')
    node.dataset.exportRegionId = region.id
    const [left, top, width, height] = rects[index]
    node.getBoundingClientRect = () => ({ x: left, y: top, left, top, right: left + width, bottom: top + height, width, height, toJSON() {} })
    root.append(node)
  })
  const tiled = getDomExportRegions(root, regions)
  expect(tiled.filter(region => region.id.startsWith('item-')).map(region => [region.x, region.width])).toEqual([[0, 125], [125, 125], [250, 125]])
  expect(scaleRegions(tiled.filter(region => region.id.startsWith('item-'))).map(region => [region.x, region.width])).toEqual([[0, 250], [250, 250], [500, 250]])
})

it('新版页尾生成保障区、四个链接、品牌区、三个均分社媒切图和地址区', () => {
  const template = getTemplate('footer-links')!.definition
  const current: FloorInstance = {
    id: 'footer', templateId: template.id, values: { background: '#FFAC33' }, products: {},
    navigationItems: [{ text: 'Shop All', url: '' }, { text: 'Contact Us', url: '' }, { text: 'FAQ', url: '' }, { text: 'Privacy Policy', url: '' }],
  }
  const regions = getFloorExportRegions(template, current)
  expect(regions.map(region => region.id)).toEqual(['trust', 'link-1', 'link-2', 'link-3', 'link-4', 'brand', 'social-instagram', 'social-tiktok', 'social-facebook', 'address'])
  expect(regions.slice(1, 5).map(region => region.name)).toEqual(['Shop All', 'Contact Us', 'FAQ', 'Privacy Policy'])
  expect(regions.slice(6, 9).map(region => region.name)).toEqual(['Instagram', 'TikTok', 'Facebook'])
})

it('新版页尾 DOM 切图将导航分为两列，并把整条社媒行均分为三个等宽区域', () => {
  const template = getTemplate('footer-links')!.definition
  const floor: FloorInstance = { id: 'footer', templateId: template.id, values: { background: '#FFAC33' }, products: {}, navigationItems: [{ text: 'Shop All', url: '' }, { text: 'Contact Us', url: '' }, { text: 'FAQ', url: '' }, { text: 'Privacy Policy', url: '' }] }
  const regions = getFloorExportRegions(template, floor)
  const root = document.createElement('section')
  Object.defineProperties(root, { clientWidth: { value: 375 }, clientHeight: { value: 315 } })
  root.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 375, bottom: 315, width: 375, height: 315, toJSON() {} })
  const rects: Record<string, [number, number, number, number]> = {
    trust: [0, 0, 375, 100], 'link-1': [0, 100, 187.5, 25], 'link-2': [187.5, 100, 187.5, 25], 'link-3': [0, 125, 187.5, 25], 'link-4': [187.5, 125, 187.5, 25], brand: [0, 150, 375, 66],
    'social-instagram': [0, 216, 125, 40], 'social-tiktok': [125, 216, 125, 40], 'social-facebook': [250, 216, 125, 40], address: [0, 256, 375, 59],
  }
  regions.forEach(region => {
    const node = document.createElement('div'); node.dataset.exportRegionId = region.id
    const [left, top, width, height] = rects[region.id]
    node.getBoundingClientRect = () => ({ x: left, y: top, left, top, right: left + width, bottom: top + height, width, height, toJSON() {} })
    root.append(node)
  })
  const tiled = getDomExportRegions(root, regions)
  expect(tiled.slice(1, 5).map(region => [region.x, region.width])).toEqual([[0, 187.5], [187.5, 187.5], [0, 187.5], [187.5, 187.5]])
  expect(tiled.slice(6, 9).map(region => [region.x, region.width])).toEqual([[0, 125], [125, 125], [250, 125]])
})
