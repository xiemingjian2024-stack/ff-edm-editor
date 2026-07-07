import { expect, it, vi } from 'vitest'
import { toJpeg } from 'html-to-image'
import { captureFloor, scaleRegion, scaleRegions } from './render'
import { getTemplate } from '../templates/registry'
import { getFloorExportRegions } from './regions'

vi.mock('html-to-image', () => ({
  toJpeg: vi.fn(async () => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w=='),
}))

it('将设计坐标转换为 2 倍导出坐标', () => {
  expect(scaleRegion({ id: 'r', name: '右侧', x: 187.5, y: 0, width: 187.5, height: 240 })).toMatchObject({ x: 375, y: 0, width: 375, height: 480 })
})

it('三等分区域总宽度保持 750 且无缝隙', () => {
  const regions = [0, 125, 250].map((x, index) => ({ id: `${index}`, name: `${index}`, x, y: 0, width: 125, height: 100 }))
  const scaled = scaleRegions(regions)
  expect(scaled.map(item => item.width)).toEqual([250, 250, 250])
  expect(scaled[2].x + scaled[2].width).toBe(750)
})

it('HEAD Logo 完整楼层按 2 倍导出为 750×112', () => {
  const template = getTemplate('head-brand-logo')!.definition
  expect(scaleRegion(template.exportRegions[0])).toMatchObject({ width: 750, height: 112 })
})

it('常规 Banner 按当前动态高度导出完整 JPG', () => {
  const template = getTemplate('banner-regular')!.definition
  const floor = { id: 'banner-1', templateId: template.id, values: { height: '420' }, products: {} }
  expect(scaleRegion(getFloorExportRegions(template, floor)[0])).toMatchObject({ width: 750, height: 840 })
})

it('CODE 模板只将顶部和底部缩放为两张独立切图', () => {
  const template = getTemplate('code-information')!.definition
  expect(template.exportRegions.map(region => region.id)).toEqual(['top', 'bottom'])
  expect(scaleRegions(template.exportRegions).map(region => ({ width: region.width, height: region.height }))).toEqual([{ width: 750, height: 120 }, { width: 750, height: 168 }])
})

it('截图导出使用楼层自身背景色而不是固定白色', async () => {
  const node = document.createElement('section')
  node.style.backgroundColor = 'rgb(255, 172, 51)'
  await captureFloor(node)
  expect(toJpeg).toHaveBeenCalledWith(node, expect.objectContaining({ backgroundColor: 'rgb(255, 172, 51)' }))
})

it('透明楼层截图仍使用白色兜底背景', async () => {
  const node = document.createElement('section')
  await captureFloor(node)
  expect(toJpeg).toHaveBeenCalledWith(node, expect.objectContaining({ backgroundColor: '#ffffff' }))
})
