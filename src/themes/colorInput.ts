export function normalizeHexColorInput(value: string): string | null {
  const trimmed = value.trim()
  const match = trimmed.match(/^#?([0-9a-fA-F]{6})$/)
  return match ? `#${match[1].toUpperCase()}` : null
}

export function isHexColorInput(value: string): boolean {
  return normalizeHexColorInput(value) !== null
}

export function getColorPreviewValue(value: string, fallback = '#FFFFFF'): string {
  return normalizeHexColorInput(value) ?? fallback
}
