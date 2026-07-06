import { describe, expect, it } from 'vitest'
import { classicPalette } from './palettes'
import { getFloorThemeFields, getThemeFieldsForFloors, migrateDraftTheme, resolveFloorForRender, resolveThemeColor } from './resolveThemeColor'
import { getTemplate } from '../templates/registry'

describe('主题颜色解析', () => {
  it('经典套餐使用白、橙、黑三色', () => {
    expect(classicPalette.slots).toEqual({ A: '#FFFFFF', B: '#FFAC33', C: '#000000' })
  })

  it('普通楼层背景按位置交替 A/B 且按钮固定使用 C', () => {
    const template = getTemplate('title-centered')!.definition
    expect(getFloorThemeFields(template, 'A')).toEqual([{ fieldId: 'background', defaultSlot: 'A' }, { fieldId: 'buttonBackground', defaultSlot: 'C' }])
    expect(getFloorThemeFields(template, 'B')).toEqual([{ fieldId: 'background', defaultSlot: 'B' }, { fieldId: 'buttonBackground', defaultSlot: 'C' }])
    const floor = { id: 'title', templateId: template.id, values: { background: '#eeeeee', buttonBackground: '#eeeeee' }, products: {} }
    expect(resolveFloorForRender(floor, template, classicPalette, getFloorThemeFields(template, 'B')).values).toMatchObject({ background: '#FFAC33', buttonBackground: '#000000' })
  })

  it('Logo、分类导航和 Banner 背景固定使用 A', () => {
    for (const id of ['head-brand-logo', 'head-category-navigation', 'banner-image-copy']) {
      const template = getTemplate(id)!.definition
      expect(getFloorThemeFields(template, 'B').find(field => field.fieldId === 'background')?.defaultSlot).toBe('A')
    }
  })

  it('固定 A 的分类导航和 Banner 之后从 B 继续交替', () => {
    const floors = [
      { id: 'nav', templateId: 'head-category-navigation', values: {}, products: {} },
      { id: 'title-1', templateId: 'title-centered', values: {}, products: {} },
      { id: 'banner', templateId: 'banner-regular', values: {}, products: {} },
      { id: 'title-2', templateId: 'title-centered', values: {}, products: {} },
      { id: 'title-3', templateId: 'title-centered', values: {}, products: {} },
    ]
    const fields = getThemeFieldsForFloors(floors)
    expect(floors.map(floor => fields[floor.id].find(field => field.fieldId === 'background')?.defaultSlot)).toEqual(['A', 'B', undefined, 'B', 'A'])
  })

  it('手动颜色覆盖动态背景与按钮色', () => {
    const template = getTemplate('title-centered')!.definition
    const floor = { id: 'title', templateId: template.id, values: { background: '#eeeeee', buttonBackground: '#eeeeee' }, products: {}, themeColors: { background: { mode: 'custom' as const, color: '#123456' }, buttonBackground: { mode: 'custom' as const, color: '#654321' } } }
    expect(resolveFloorForRender(floor, template, classicPalette, getFloorThemeFields(template, 'B')).values).toMatchObject({ background: '#123456', buttonBackground: '#654321' })
  })
  it('按自定义覆盖、套餐色位、字段默认值的顺序解析', () => {
    expect(resolveThemeColor({ mode: 'custom', color: '#123456' }, 'A', classicPalette, '#FFFFFF')).toBe('#123456')
    expect(resolveThemeColor({ mode: 'theme', slot: 'C' }, 'A', classicPalette, '#FFFFFF')).toBe('#000000')
    expect(resolveThemeColor({ mode: 'theme', slot: 'D' }, 'A', classicPalette, '#ABCDEF')).toBe('#ABCDEF')
  })

  it('旧草稿补充经典套餐，并保留已有主题字段颜色', () => {
    const migrated = migrateDraftTheme({
      id: 'legacy',
      name: '旧草稿',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      floors: [{
        id: 'head-1',
        templateId: 'head-brand-logo',
        values: { background: '#EFEFEF', logoColor: '#000000' },
        products: {},
      }],
    }, () => ({ definition: {
      id: 'head-brand-logo', version: 1, name: '品牌 Logo', category: 'head', designWidth: 375, designHeight: 56,
      fields: [{ id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' }],
      themeColorFields: [{ fieldId: 'background', defaultSlot: 'A' }], productSlots: [], exportRegions: [],
    } }))

    expect(migrated.themePaletteId).toBe('funnyfuzzy-classic')
    expect(migrated.floors[0].themeColors?.background).toEqual({ mode: 'custom', color: '#EFEFEF' })
  })

  it('迁移新结构时保持主题关联且结果幂等', () => {
    const current = {
      id: 'current',
      name: '新草稿',
      themePaletteId: 'funnyfuzzy-classic',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      floors: [{
        id: 'head-1',
        templateId: 'head-brand-logo',
        values: { background: '#FFFFFF', logoColor: '#000000' },
        products: {},
        themeColors: { background: { mode: 'theme' as const, slot: 'A' } },
      }],
    }

    expect(migrateDraftTheme(migrateDraftTheme(current))).toEqual(current)
  })
})
