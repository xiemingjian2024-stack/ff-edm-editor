import type { EdmDraft, FloorInstance, MediaState, NavigationItem, ProductValue, TextHighlight, ThemeSlot } from '../domain/edm'
import { getTemplate } from '../templates/registry'

export interface EditorState { draft: EdmDraft; selectedFloorId: string | null }
export type EditorAction =
  | { type: 'loadDraft'; draft: EdmDraft }
  | { type: 'renameDraft'; name: string }
  | { type: 'addFloor'; templateId: string }
  | { type: 'deleteFloor'; floorId: string }
  | { type: 'selectFloor'; floorId: string }
  | { type: 'reorderFloor'; floorId: string; overFloorId: string }
  | { type: 'updateField'; floorId: string; fieldId: string; value: string }
  | { type: 'updateTextHighlight'; floorId: string; fieldId: string; value: TextHighlight }
  | { type: 'updateProduct'; floorId: string; slotId: string; value: ProductValue }
  | { type: 'changeThemePalette'; paletteId: string }
  | { type: 'overrideThemeColor'; floorId: string; fieldId: string; color: string }
  | { type: 'relinkThemeColor'; floorId: string; fieldId: string; slot: ThemeSlot }
  | { type: 'updateNavigationItem'; floorId: string; index: number; value: NavigationItem }
  | { type: 'updateMedia'; floorId: string; value: MediaState }
  | { type: 'updateBannerAnimation'; floorId: string; value: import('../domain/edm').BannerAnimation }
  | { type: 'updateMediaSlot'; floorId: string; slotId: string; value: MediaState }

const now = new Date().toISOString()
export const initialEditorState: EditorState = { draft: { id: 'draft-local', name: '未命名 EDM', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: now, updatedAt: now }, selectedFloorId: null }

export function createFloorInstance(templateId: string, id: string): FloorInstance {
  const template = getTemplate(templateId)?.definition
  if (!template) throw new Error(`模板不存在：${templateId}`)
  return {
    id,
    templateId,
    values: Object.fromEntries(template.fields.map(field => [field.id, field.defaultValue])),
    products: Object.fromEntries(template.productSlots.filter(slot => slot.defaultActionText !== undefined).map(slot => [slot.id, { image: '', title: '', price: '', url: '', gallery: [], actionText: slot.defaultActionText }])),
    navigationItems: template.navigationConfig ? structuredClone(template.navigationConfig.defaultItems) : undefined,
    media: template.mediaConfig ? { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 } : undefined,
    mediaSlots: template.mediaSlots ? Object.fromEntries(template.mediaSlots.map(slot => [slot.id, { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }])) : undefined,
    themeColors: Object.fromEntries((template.themeColorFields ?? []).map(field => [field.fieldId, { mode: 'theme' as const, slot: field.defaultSlot }])),
  }
}

function hydrateFloorDefaults(floor: FloorInstance): FloorInstance {
  const template = getTemplate(floor.templateId)?.definition
  if (!template) return floor
  const navigationItems = template.navigationConfig
    ? template.navigationConfig.defaultItems.map((fallback, index) => {
      const current = floor.navigationItems?.[index]
      if (!current) return structuredClone(fallback)
      return { ...fallback, ...current, url: current.url?.trim() || fallback.url }
    })
    : floor.navigationItems
  const products = { ...floor.products }
  for (const slot of template.productSlots) {
    if (slot.defaultActionText === undefined) continue
    const legacyActionText = floor.values.cardButtonText ?? slot.defaultActionText
    products[slot.id] = products[slot.id]
      ? { ...products[slot.id], actionText: products[slot.id].actionText ?? legacyActionText }
      : { image: '', title: '', price: '', url: '', gallery: [], actionText: legacyActionText }
  }
  return { ...floor, values: { ...Object.fromEntries(template.fields.map(field => [field.id, field.defaultValue])), ...floor.values }, products, navigationItems }
}

export function createEditorReducer(createId: () => string = () => crypto.randomUUID()) {
  return (state: EditorState, action: EditorAction): EditorState => {
    let floors = state.draft.floors
    let selectedFloorId = state.selectedFloorId
    if (action.type === 'loadDraft') {
      const draft = { ...action.draft, floors: action.draft.floors.map(hydrateFloorDefaults) }
      return { draft, selectedFloorId: draft.floors[0]?.id ?? null }
    }
    if (action.type === 'renameDraft') return { ...state, draft: { ...state.draft, name: action.name, updatedAt: new Date().toISOString() } }
    if (action.type === 'changeThemePalette') return { ...state, draft: { ...state.draft, themePaletteId: action.paletteId, updatedAt: new Date().toISOString() } }
    if (action.type === 'addFloor') {
      if ((action.templateId === 'head-brand-logo' || action.templateId === 'footer-links') && floors.some(item => item.templateId === action.templateId)) return state
      const floor = createFloorInstance(action.templateId, createId())
      if (action.templateId === 'head-brand-logo') floors = [floor, ...floors]
      else if (action.templateId === 'footer-links') floors = [...floors, floor]
      else { const footerIndex = floors.findIndex(item => item.templateId === 'footer-links'); floors = footerIndex < 0 ? [...floors, floor] : [...floors.slice(0, footerIndex), floor, ...floors.slice(footerIndex)] }
      selectedFloorId = floor.id
    } else if (action.type === 'deleteFloor') {
      floors = floors.filter(item => item.id !== action.floorId); selectedFloorId = floors[0]?.id ?? null
    } else if (action.type === 'selectFloor') selectedFloorId = action.floorId
    else if (action.type === 'reorderFloor') {
      const from = floors.findIndex(item => item.id === action.floorId)
      const over = floors.findIndex(item => item.id === action.overFloorId)
      if (from < 0 || over < 0 || from === over) return state
      if (floors[from].templateId === 'head-brand-logo' || floors[from].templateId === 'footer-links') return state
      const firstMovable = floors[0]?.templateId === 'head-brand-logo' ? 1 : 0
      const lastMovable = floors.at(-1)?.templateId === 'footer-links' ? floors.length - 2 : floors.length - 1
      const to = Math.min(lastMovable, Math.max(firstMovable, over))
      floors = [...floors]
      const [moved] = floors.splice(from, 1)
      floors.splice(to, 0, moved)
    } else if (action.type === 'updateField') {
      floors = floors.map(floor => {
        if (floor.id !== action.floorId) return floor
        const template = getTemplate(floor.templateId)?.definition
        if (!template?.fields.some(field => field.id === action.fieldId)) return floor
        return { ...floor, values: { ...floor.values, [action.fieldId]: action.value } }
      })
    } else if (action.type === 'updateTextHighlight') {
      floors = floors.map(floor => {
        if (floor.id !== action.floorId) return floor
        const template = getTemplate(floor.templateId)?.definition
        if (!template?.fields.some(field => field.id === action.fieldId && field.type === 'text')) return floor
        return { ...floor, textHighlights: { ...floor.textHighlights, [action.fieldId]: action.value } }
      })
    } else if (action.type === 'updateProduct') {
      floors = floors.map(floor => floor.id === action.floorId ? { ...floor, products: { ...floor.products, [action.slotId]: action.value } } : floor)
    } else if (action.type === 'overrideThemeColor') {
      floors = floors.map(floor => floor.id === action.floorId ? {
        ...floor,
        values: { ...floor.values, [action.fieldId]: action.color },
        themeColors: { ...floor.themeColors, [action.fieldId]: { mode: 'custom', color: action.color } },
      } : floor)
    } else if (action.type === 'relinkThemeColor') {
      floors = floors.map(floor => floor.id === action.floorId ? {
        ...floor,
        themeColors: { ...floor.themeColors, [action.fieldId]: { mode: 'theme', slot: action.slot } },
      } : floor)
    } else if (action.type === 'updateNavigationItem') {
      floors = floors.map(floor => {
        if (floor.id !== action.floorId || !floor.navigationItems?.[action.index]) return floor
        const navigationItems = [...floor.navigationItems]
        navigationItems[action.index] = action.value
        return { ...floor, navigationItems }
      })
    } else if (action.type === 'updateMedia') {
      floors = floors.map(floor => floor.id === action.floorId ? { ...floor, media: action.value } : floor)
    } else if (action.type === 'updateBannerAnimation') {
      floors = floors.map(floor => floor.id === action.floorId ? { ...floor, animation: action.value } : floor)
    } else if (action.type === 'updateMediaSlot') {
      floors = floors.map(floor => floor.id === action.floorId && floor.mediaSlots?.[action.slotId] ? { ...floor, mediaSlots: { ...floor.mediaSlots, [action.slotId]: action.value } } : floor)
    }
    return { draft: { ...state.draft, floors, updatedAt: new Date().toISOString() }, selectedFloorId }
  }
}

export const editorReducer = createEditorReducer()
