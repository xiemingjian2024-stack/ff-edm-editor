import { parseTemplate } from './schema'
import { twoProductTemplate } from '../test/fixtures'

it('接受合法的双商品模板', () => {
  expect(() => parseTemplate(twoProductTemplate)).not.toThrow()
})

it('拒绝引用不存在商品槽位的导出区域', () => {
  expect(() => parseTemplate({
    ...twoProductTemplate,
    exportRegions: [{ id: 'bad', name: '错误区域', x: 0, y: 0, width: 187.5, height: 240, linkSlotId: 'missing' }]
  })).toThrow(/linkSlotId/)
})

it('拒绝超出楼层范围的导出区域', () => {
  expect(() => parseTemplate({
    ...twoProductTemplate,
    exportRegions: [{ id: 'bad', name: '越界区域', x: 300, y: 0, width: 100, height: 240 }]
  })).toThrow(/边界/)
})
