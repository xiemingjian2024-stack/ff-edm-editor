import type { ThemePalette } from '../domain/edm'

export const classicPalette: ThemePalette = {
  id: 'funnyfuzzy-classic',
  name: 'FunnyFuzzy 经典',
  slots: { A: '#FFFFFF', B: '#000000', C: '#FFAC33' },
}

export const themePalettes = [classicPalette]

export function getThemePalette(id: string | undefined): ThemePalette {
  return themePalettes.find(item => item.id === id) ?? classicPalette
}
