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

it('接受选项字段和有效的主题色位声明', () => {
  expect(() => parseTemplate({
    ...twoProductTemplate,
    fields: [
      ...twoProductTemplate.fields,
      { id: 'logoColor', type: 'choice', label: 'Logo 颜色', defaultValue: '#000000', options: [{ label: '黑色', value: '#000000' }] },
    ],
    themeColorFields: [{ fieldId: 'background', defaultSlot: 'A' }],
  })).not.toThrow()
})

it('拒绝把主题色位关联到非颜色字段', () => {
  expect(() => parseTemplate({
    ...twoProductTemplate,
    fields: [{ id: 'title', type: 'text', label: '标题', defaultValue: 'Title' }],
    themeColorFields: [{ fieldId: 'title', defaultSlot: 'A' }],
  })).toThrow(/颜色字段/)
})

it('接受内容自适应高度模板声明', () => {
  expect(parseTemplate({ ...twoProductTemplate, autoHeight: true }).autoHeight).toBe(true)
})

it('接受两个具名媒体槽位声明', () => {
  expect(parseTemplate({ ...twoProductTemplate, mediaSlots: [{ id: 'before', label: 'Before 图片' }, { id: 'after', label: 'After 图片' }] }).mediaSlots).toEqual([{ id: 'before', label: 'Before 图片' }, { id: 'after', label: 'After 图片' }])
})
