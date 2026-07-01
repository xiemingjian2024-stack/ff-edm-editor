import type { ComponentType } from 'react'

export type TemplateCategory = 'head' | 'banner' | 'title' | 'product-card' | 'content' | 'promotion' | 'footer'
export type ThemeSlot = string
export interface ThemePalette { id: string; name: string; slots: Record<ThemeSlot, string> }
export type ThemeColorBinding = { mode: 'theme'; slot: ThemeSlot } | { mode: 'custom'; color: string }
export type FieldDefinition =
  | { id: string; type: 'text'; label: string; defaultValue: string }
  | { id: string; type: 'color'; label: string; defaultValue: string }
  | { id: string; type: 'image'; label: string; defaultValue: string }
  | { id: string; type: 'choice'; label: string; defaultValue: string; options: Array<{ label: string; value: string }> }

export interface ProductSlotDefinition { id: string; label: string }
export interface ExportRegion { id: string; name: string; x: number; y: number; width: number; height: number; linkSlotId?: string }
export interface ThemeColorField { fieldId: string; defaultSlot: ThemeSlot }
export interface FloorTemplate {
  id: string; version: number; name: string; category: TemplateCategory; designWidth: 375; designHeight: number
  fields: FieldDefinition[]; productSlots: ProductSlotDefinition[]; exportRegions: ExportRegion[]; themeColorFields?: ThemeColorField[]
}
export interface ProductValue { image: string; title: string; price: string; url: string; gallery?: string[] }
export interface FloorInstance { id: string; templateId: string; values: Record<string, string>; products: Record<string, ProductValue>; themeColors?: Record<string, ThemeColorBinding> }
export interface EdmDraft { id: string; name: string; floors: FloorInstance[]; themePaletteId: string; createdAt: string; updatedAt: string }
export interface NormalizedProduct { title: string; image: string; gallery: string[]; price: string; url: string }
export interface FloorRenderProps { floor: FloorInstance; template: FloorTemplate }
export interface RegisteredTemplate { definition: FloorTemplate; Renderer: ComponentType<FloorRenderProps> }
