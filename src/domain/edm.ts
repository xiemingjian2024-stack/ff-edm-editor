import type { ComponentType } from 'react'

export type TemplateCategory = 'head' | 'banner' | 'title' | 'information' | 'product-card' | 'content' | 'promotion' | 'footer'
export type ThemeSlot = string
export interface ThemePalette { id: string; name: string; slots: Record<ThemeSlot, string> }
export type ThemeColorBinding = { mode: 'theme'; slot: ThemeSlot } | { mode: 'custom'; color: string }
export type FieldDefinition =
  | { id: string; type: 'text'; label: string; defaultValue: string }
  | { id: string; type: 'color'; label: string; defaultValue: string }
  | { id: string; type: 'image'; label: string; defaultValue: string }
  | { id: string; type: 'choice'; label: string; defaultValue: string; options: Array<{ label: string; value: string }> }
  | { id: string; type: 'range'; label: string; defaultValue: string; min: number; max: number; step: number; unit?: string }

export interface ProductSlotDefinition { id: string; label: string; showPrice?: boolean }
export interface NavigationItem { text: string; url: string }
export interface NavigationConfig { minItems: number; maxItems: number; defaultItems: NavigationItem[] }
export interface MediaState { image: string; url: string; scale: number; offsetX: number; offsetY: number }
export interface BannerAnimation { enabled: boolean; intervalMs: number; frames: MediaState[] }
export interface MediaConfig { frameHeightFieldId?: string; fixedFrameHeight?: number }
export interface MediaSlotDefinition { id: string; label: string }
export interface HeightConfig { fieldId: string; min: number; max: number; offset: number }
export interface ExportRegion { id: string; name: string; x: number; y: number; width: number; height: number; linkSlotId?: string; navigationItemIndex?: number; mediaLink?: boolean }
export interface ThemeColorField { fieldId: string; defaultSlot: ThemeSlot }
export interface FloorTemplate {
  id: string; version: number; name: string; category: TemplateCategory; designWidth: 375; designHeight: number
  fields: FieldDefinition[]; productSlots: ProductSlotDefinition[]; exportRegions: ExportRegion[]; themeColorFields?: ThemeColorField[]
  navigationConfig?: NavigationConfig; exportFullImage?: boolean; mediaConfig?: MediaConfig; mediaSlots?: MediaSlotDefinition[]; mediaSlotCountFieldId?: string; productSlotCountFieldId?: string; domExportRegions?: boolean; heightConfig?: HeightConfig; autoHeight?: boolean; hiddenInLibrary?: boolean
}
export interface ProductValue { image: string; title: string; price: string; url: string; gallery?: string[]; imageScale?: number; imageOffsetX?: number; imageOffsetY?: number }
export interface FloorInstance { id: string; templateId: string; values: Record<string, string>; products: Record<string, ProductValue>; themeColors?: Record<string, ThemeColorBinding>; navigationItems?: NavigationItem[]; media?: MediaState; mediaSlots?: Record<string, MediaState>; animation?: BannerAnimation }
export interface EdmDraft { id: string; name: string; floors: FloorInstance[]; themePaletteId: string; createdAt: string; updatedAt: string }
export interface ExportRecord { id: string; draft: EdmDraft; exportedAt: string }
export interface NormalizedProduct { title: string; image: string; gallery: string[]; price: string; url: string }
export interface FloorRenderProps { floor: FloorInstance; template: FloorTemplate; onMediaChange?: (value: MediaState) => void; onMediaSlotChange?: (slotId: string, value: MediaState) => void; onProductChange?: (slotId: string, value: ProductValue) => void }
export interface RegisteredTemplate { definition: FloorTemplate; Renderer: ComponentType<FloorRenderProps> }
