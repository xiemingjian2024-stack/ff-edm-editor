import type { EdmDraft, FloorInstance, FloorTemplate, ThemeColorBinding, ThemePalette, ThemeSlot } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { classicPalette } from './palettes'

type LegacyEdmDraft = Omit<EdmDraft, 'themePaletteId'> & { themePaletteId?: string }
type FindTemplate = (id: string) => { definition: FloorTemplate } | undefined

export function resolveThemeColor(
  binding: ThemeColorBinding | undefined,
  defaultSlot: ThemeSlot,
  palette: ThemePalette,
  fallback: string,
): string {
  if (binding?.mode === 'custom') return binding.color
  return palette.slots[binding?.slot ?? defaultSlot] ?? fallback
}

const fixedBackgroundTemplateIds = new Set(['head-brand-logo', 'head-category-navigation', 'head-top-banner'])
const customBackgroundTemplateIds = new Set(['footer-links'])
const hasColorField = (template: FloorTemplate, fieldId: string) => template.fields.some(field => field.id === fieldId && field.type === 'color')

export function getFloorThemeFields(template: FloorTemplate, alternatingBackgroundSlot: ThemeSlot): Array<{ fieldId: string; defaultSlot: ThemeSlot }> {
  const fields: Array<{ fieldId: string; defaultSlot: ThemeSlot }> = []
  if (hasColorField(template, 'background') && !customBackgroundTemplateIds.has(template.id)) fields.push({ fieldId: 'background', defaultSlot: fixedBackgroundTemplateIds.has(template.id) || template.category === 'banner' ? 'A' : alternatingBackgroundSlot })
  if (hasColorField(template, 'buttonBackground')) fields.push({ fieldId: 'buttonBackground', defaultSlot: 'C' })
  return fields
}

export function getThemeFieldsForFloors(floors: FloorInstance[], findTemplate: FindTemplate = getTemplate): Record<string, Array<{ fieldId: string; defaultSlot: ThemeSlot }>> {
  let nextBackgroundSlot: ThemeSlot = 'A'
  return Object.fromEntries(floors.map(floor => {
    const template = findTemplate(floor.templateId)?.definition
    if (!template) return [floor.id, []]
    const fixedBackground = fixedBackgroundTemplateIds.has(template.id) || template.category === 'banner'
    const fields = getFloorThemeFields(template, nextBackgroundSlot)
    if (fixedBackground) nextBackgroundSlot = 'B'
    else if (fields.some(field => field.fieldId === 'background')) nextBackgroundSlot = nextBackgroundSlot === 'A' ? 'B' : 'A'
    return [floor.id, fields]
  }))
}

export function resolveFloorForRender(floor: FloorInstance, template: FloorTemplate, palette: ThemePalette, themeFields = template.themeColorFields ?? []): FloorInstance {
  const values = { ...floor.values }
  for (const themedField of themeFields) {
    const field = template.fields.find(item => item.id === themedField.fieldId && item.type === 'color')
    if (!field) continue
    const binding = floor.themeColors?.[themedField.fieldId]
    values[themedField.fieldId] = resolveThemeColor(
      binding?.mode === 'custom' ? binding : undefined,
      themedField.defaultSlot,
      palette,
      field.defaultValue,
    )
  }
  return { ...floor, values }
}

export function migrateDraftTheme(draft: LegacyEdmDraft, findTemplate: FindTemplate = getTemplate): EdmDraft {
  const themeFields = getThemeFieldsForFloors(draft.floors, findTemplate)
  const floors = draft.floors.map(floor => {
    const declarations = themeFields[floor.id] ?? []
    if (floor.themeColors || declarations.length === 0) return floor
    const themeColors = Object.fromEntries(declarations.map(({ fieldId, defaultSlot }) => {
      const existing = floor.values[fieldId]
      return [fieldId, existing
        ? { mode: 'custom' as const, color: existing }
        : { mode: 'theme' as const, slot: defaultSlot }]
    }))
    return { ...floor, themeColors }
  })
  return { ...draft, floors, themePaletteId: draft.themePaletteId ?? classicPalette.id }
}
