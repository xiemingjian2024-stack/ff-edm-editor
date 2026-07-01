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

export function resolveFloorForRender(floor: FloorInstance, template: FloorTemplate, palette: ThemePalette): FloorInstance {
  const values = { ...floor.values }
  for (const themedField of template.themeColorFields ?? []) {
    const field = template.fields.find(item => item.id === themedField.fieldId && item.type === 'color')
    if (!field) continue
    values[themedField.fieldId] = resolveThemeColor(
      floor.themeColors?.[themedField.fieldId],
      themedField.defaultSlot,
      palette,
      field.defaultValue,
    )
  }
  return { ...floor, values }
}

export function migrateDraftTheme(draft: LegacyEdmDraft, findTemplate: FindTemplate = getTemplate): EdmDraft {
  const floors = draft.floors.map(floor => {
    const declarations = findTemplate(floor.templateId)?.definition.themeColorFields ?? []
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
