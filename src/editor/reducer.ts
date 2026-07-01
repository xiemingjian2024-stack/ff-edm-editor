import type { EdmDraft, FloorInstance, ProductValue, ThemeSlot } from '../domain/edm'
import { getTemplate } from '../templates/registry'

export interface EditorState { draft: EdmDraft; selectedFloorId: string | null }
export type EditorAction =
  | { type: 'loadDraft'; draft: EdmDraft }
  | { type: 'renameDraft'; name: string }
  | { type: 'addFloor'; templateId: string }
  | { type: 'duplicateFloor'; floorId: string }
  | { type: 'deleteFloor'; floorId: string }
  | { type: 'selectFloor'; floorId: string }
  | { type: 'moveFloor'; floorId: string; direction: -1 | 1 }
  | { type: 'updateField'; floorId: string; fieldId: string; value: string }
  | { type: 'updateProduct'; floorId: string; slotId: string; value: ProductValue }
  | { type: 'changeThemePalette'; paletteId: string }
  | { type: 'overrideThemeColor'; floorId: string; fieldId: string; color: string }
  | { type: 'relinkThemeColor'; floorId: string; fieldId: string; slot: ThemeSlot }

const now = new Date().toISOString()
export const initialEditorState: EditorState = { draft: { id: 'draft-local', name: '未命名 EDM', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: now, updatedAt: now }, selectedFloorId: null }

function createFloor(templateId: string, id: string): FloorInstance {
  const template = getTemplate(templateId)?.definition
  if (!template) throw new Error(`模板不存在：${templateId}`)
  return {
    id,
    templateId,
    values: Object.fromEntries(template.fields.map(field => [field.id, field.defaultValue])),
    products: {},
    themeColors: Object.fromEntries((template.themeColorFields ?? []).map(field => [field.fieldId, { mode: 'theme' as const, slot: field.defaultSlot }])),
  }
}

export function createEditorReducer(createId: () => string = () => crypto.randomUUID()) {
  return (state: EditorState, action: EditorAction): EditorState => {
    let floors = state.draft.floors
    let selectedFloorId = state.selectedFloorId
    if (action.type === 'loadDraft') return { draft: action.draft, selectedFloorId: action.draft.floors[0]?.id ?? null }
    if (action.type === 'renameDraft') return { ...state, draft: { ...state.draft, name: action.name, updatedAt: new Date().toISOString() } }
    if (action.type === 'changeThemePalette') return { ...state, draft: { ...state.draft, themePaletteId: action.paletteId, updatedAt: new Date().toISOString() } }
    if (action.type === 'addFloor') {
      const floor = createFloor(action.templateId, createId()); floors = [...floors, floor]; selectedFloorId = floor.id
    } else if (action.type === 'duplicateFloor') {
      const index = floors.findIndex(item => item.id === action.floorId); if (index < 0) return state
      const copy = structuredClone(floors[index]); copy.id = createId(); floors = [...floors.slice(0, index + 1), copy, ...floors.slice(index + 1)]; selectedFloorId = copy.id
    } else if (action.type === 'deleteFloor') {
      floors = floors.filter(item => item.id !== action.floorId); selectedFloorId = floors[0]?.id ?? null
    } else if (action.type === 'selectFloor') selectedFloorId = action.floorId
    else if (action.type === 'moveFloor') {
      const from = floors.findIndex(item => item.id === action.floorId); const to = from + action.direction
      if (from < 0 || to < 0 || to >= floors.length) return state
      floors = [...floors]; [floors[from], floors[to]] = [floors[to], floors[from]]
    } else if (action.type === 'updateField') {
      floors = floors.map(floor => {
        if (floor.id !== action.floorId) return floor
        const template = getTemplate(floor.templateId)?.definition
        if (!template?.fields.some(field => field.id === action.fieldId)) return floor
        return { ...floor, values: { ...floor.values, [action.fieldId]: action.value } }
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
    }
    return { draft: { ...state.draft, floors, updatedAt: new Date().toISOString() }, selectedFloorId }
  }
}

export const editorReducer = createEditorReducer()
