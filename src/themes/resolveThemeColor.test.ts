import { describe, expect, it } from 'vitest'
import { classicPalette } from './palettes'
import { migrateDraftTheme, resolveThemeColor } from './resolveThemeColor'

describe('主题颜色解析', () => {
  it('按自定义覆盖、套餐色位、字段默认值的顺序解析', () => {
    expect(resolveThemeColor({ mode: 'custom', color: '#123456' }, 'A', classicPalette, '#FFFFFF')).toBe('#123456')
    expect(resolveThemeColor({ mode: 'theme', slot: 'C' }, 'A', classicPalette, '#FFFFFF')).toBe('#FFAC33')
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
