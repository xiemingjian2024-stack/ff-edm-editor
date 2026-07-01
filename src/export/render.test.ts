import { scaleRegion, scaleRegions } from './render'
import { getTemplate } from '../templates/registry'

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
