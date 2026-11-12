import type { FloorInstance } from '../domain/edm'

type LogoRun = readonly [width: number, backgroundAmount: number]

// Generated from public/assets/brand-logo.svg at its native 90 × 30 size.
// Consecutive pixels are run-length encoded; 0 is the logo color and 255 is the background.
const LOGO_ROWS: readonly (readonly LogoRun[])[] = [
  [[90,255]],
  [[90,255]],
  [[1,255],[9,0],[2,255],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[2,0],[1,170],[4,255],[1,170],[2,0],[1,85],[1,255],[1,170],[2,0],[1,170],[5,255],[2,0],[1,85],[1,255],[4,0],[4,255],[3,0],[1,85],[9,255],[1,170],[3,0],[1,85],[4,255],[1,85],[3,0],[1,85],[1,170],[4,255]],
  [[1,255],[9,0],[2,255],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[3,0],[1,170],[3,255],[1,170],[2,0],[1,85],[1,255],[1,170],[3,0],[1,170],[4,255],[2,0],[1,85],[1,255],[1,170],[3,0],[1,85],[2,255],[1,85],[3,0],[9,255],[7,0],[1,170],[1,255],[7,0],[1,170],[3,255]],
  [[1,255],[4,0],[5,85],[2,255],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[4,0],[1,170],[2,255],[1,170],[2,0],[1,85],[1,255],[1,170],[4,0],[1,170],[3,255],[2,0],[1,85],[2,255],[1,85],[3,0],[2,170],[3,0],[1,170],[8,255],[1,85],[17,0],[3,255]],
  [[1,255],[3,0],[1,85],[7,255],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[5,0],[1,170],[1,255],[1,170],[2,0],[1,85],[1,255],[1,170],[5,0],[1,170],[2,255],[2,0],[1,85],[2,255],[1,170],[3,0],[2,85],[3,0],[8,255],[1,170],[18,0],[1,85],[2,255]],
  [[1,255],[3,0],[1,85],[4,170],[3,255],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[6,0],[2,170],[2,0],[1,85],[1,255],[1,170],[6,0],[1,170],[1,255],[2,0],[1,85],[3,255],[1,85],[6,0],[1,170],[8,255],[1,170],[18,0],[1,85],[2,255]],
  [[1,255],[8,0],[1,170],[2,255],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[2,0],[1,85],[4,0],[1,85],[2,0],[1,85],[1,255],[1,170],[2,0],[1,85],[4,0],[1,85],[2,0],[1,85],[4,255],[5,0],[1,85],[9,255],[1,170],[18,0],[1,170],[2,255]],
  [[1,255],[8,0],[1,170],[2,255],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[2,0],[2,170],[6,0],[1,85],[1,255],[1,170],[2,0],[1,85],[1,255],[6,0],[1,85],[4,255],[1,170],[4,0],[10,255],[1,85],[18,0],[1,85],[2,255]],
  [[1,255],[4,0],[4,85],[1,170],[2,255],[4,0],[2,255],[1,170],[3,0],[1,170],[1,255],[1,170],[2,0],[1,170],[1,255],[1,170],[5,0],[1,85],[1,255],[1,170],[2,0],[1,85],[2,255],[5,0],[1,85],[5,255],[3,0],[1,85],[10,255],[10,0],[1,85],[1,255],[1,85],[2,170],[5,0],[2,255]],
  [[1,255],[3,0],[1,85],[7,255],[1,85],[4,0],[1,85],[4,0],[1,170],[1,255],[1,170],[2,0],[1,170],[2,255],[1,170],[4,0],[1,85],[1,255],[1,170],[2,0],[1,85],[3,255],[4,0],[1,85],[5,255],[3,0],[1,85],[10,255],[10,0],[1,170],[4,255],[5,0],[1,170],[1,255]],
  [[1,255],[3,0],[1,85],[7,255],[1,170],[8,0],[1,85],[2,255],[1,170],[2,0],[1,170],[3,255],[1,170],[3,0],[1,85],[1,255],[1,170],[2,0],[1,85],[4,255],[3,0],[1,85],[5,255],[3,0],[1,85],[10,255],[1,170],[1,85],[8,0],[1,170],[4,255],[5,0],[2,255]],
  [[1,255],[3,0],[1,85],[8,255],[1,170],[1,85],[5,0],[1,85],[3,255],[1,170],[2,0],[1,170],[4,255],[1,170],[2,0],[1,85],[1,255],[1,170],[2,0],[1,85],[5,255],[2,0],[1,85],[5,255],[3,0],[1,85],[11,255],[1,85],[9,0],[3,255],[1,85],[5,0],[2,255]],
  [[16,255],[3,170],[51,255],[10,0],[1,85],[5,0],[1,170],[3,255]],
  [[70,255],[16,0],[4,255]],
  [[70,255],[1,170],[14,0],[1,85],[4,255]],
  [[1,255],[9,0],[1,255],[1,170],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[10,0],[1,85],[1,255],[1,170],[10,0],[1,85],[1,255],[4,0],[4,255],[3,0],[1,85],[10,255],[1,85],[10,0],[1,170],[1,85],[5,255]],
  [[1,255],[9,0],[1,255],[1,170],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[10,0],[1,85],[1,255],[1,170],[10,0],[1,85],[1,255],[1,170],[3,0],[1,85],[2,255],[1,85],[3,0],[11,255],[1,170],[9,0],[1,85],[7,255]],
  [[1,255],[4,0],[5,85],[1,255],[1,170],[3,0],[1,85],[3,255],[3,0],[1,85],[1,255],[1,170],[5,85],[5,0],[1,170],[1,255],[1,170],[5,85],[5,0],[1,170],[2,255],[1,85],[3,0],[2,170],[3,0],[1,170],[12,255],[1,85],[1,170],[6,0],[1,85],[8,255]],
  [[1,255],[3,0],[1,85],[6,255],[1,170],[3,0],[1,85],[3,255],[3,0],[1,85],[6,255],[1,170],[4,0],[1,170],[7,255],[1,170],[4,0],[1,170],[4,255],[3,0],[1,85],[3,0],[1,85],[15,255],[1,170],[1,85],[3,0],[1,170],[9,255]],
  [[1,255],[4,0],[4,170],[2,255],[1,170],[3,0],[1,85],[3,255],[3,0],[1,85],[5,255],[1,170],[4,0],[1,170],[7,255],[1,170],[4,0],[1,170],[5,255],[1,85],[6,0],[1,170],[17,255],[2,170],[11,255]],
  [[1,255],[8,0],[1,170],[1,255],[1,170],[3,0],[1,85],[3,255],[3,0],[1,85],[4,255],[1,170],[4,0],[1,170],[7,255],[1,170],[4,0],[1,85],[7,255],[5,0],[1,85],[31,255]],
  [[1,255],[8,0],[1,170],[2,255],[3,0],[1,85],[3,255],[3,0],[1,85],[3,255],[1,170],[4,0],[1,170],[7,255],[1,170],[4,0],[1,85],[8,255],[1,170],[4,0],[32,255]],
  [[1,255],[4,0],[4,170],[3,255],[4,0],[2,255],[1,170],[3,0],[1,170],[2,255],[1,170],[4,0],[1,85],[7,255],[1,170],[4,0],[1,85],[10,255],[3,0],[1,85],[32,255]],
  [[1,255],[3,0],[1,85],[7,255],[1,85],[9,0],[2,255],[1,170],[10,0],[1,85],[2,255],[10,0],[1,85],[5,255],[3,0],[1,85],[32,255]],
  [[1,255],[3,0],[1,85],[8,255],[8,0],[1,85],[2,255],[1,170],[10,0],[1,85],[1,255],[1,170],[10,0],[1,85],[5,255],[3,0],[1,85],[32,255]],
  [[1,255],[3,0],[1,85],[9,255],[1,85],[5,0],[1,170],[3,255],[1,170],[10,0],[1,85],[1,255],[1,170],[10,0],[1,85],[5,255],[3,0],[1,85],[32,255]],
  [[16,255],[2,170],[72,255]],
  [[90,255]],
  [[90,255]],
]

const normalizeHex = (value: string | undefined, fallback: string) => {
  const candidate = value?.trim().replace(/^#/, '') ?? ''
  return /^[0-9a-f]{6}$/i.test(candidate) ? `#${candidate.toUpperCase()}` : fallback
}

const toRgb = (hex: string) => [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16))

const blend = (foreground: string, background: string, backgroundAmount: number) => {
  const fg = toRgb(foreground)
  const bg = toRgb(background)
  const amount = backgroundAmount / 255
  const channel = (index: number) => Math.round(fg[index] * (1 - amount) + bg[index] * amount).toString(16).padStart(2, '0').toUpperCase()
  return `#${channel(0)}${channel(1)}${channel(2)}`
}

const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const normalizeLink = (value: string | undefined) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return 'https://funnyfuzzy.com/'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9.-]+(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return 'https://funnyfuzzy.com/'
}

export function buildBrandLogoEmailHtml(floor: FloorInstance) {
  const background = normalizeHex(floor.values.background, '#FFFFFF')
  const foreground = normalizeHex(floor.values.logoColor, '#000000')
  const link = escapeAttribute(normalizeLink(floor.values.logoLink))
  const colors = new Map<number, string>()
  const colorFor = (backgroundAmount: number) => {
    const cached = colors.get(backgroundAmount)
    if (cached) return cached
    const color = blend(foreground, background, backgroundAmount)
    colors.set(backgroundAmount, color)
    return color
  }
  const logo = LOGO_ROWS.map(row => {
    const cells = row.map(([width, backgroundAmount]) => `<td width="${width}" bgcolor="${colorFor(backgroundAmount)}">&nbsp;</td>`).join('')
    return `<table role="presentation" width="90" height="1" border="0" cellpadding="0" cellspacing="0" style="width:90px;height:1px;border-collapse:collapse;table-layout:fixed;font-size:0;line-height:0;mso-table-lspace:0;mso-table-rspace:0"><tr>${cells}</tr></table>`
  }).join('')

  return `<!-- FUNNYFUZZY 固定 Logo：纯 HTML 色块版；不含 img、SVG 或外部图片请求。 -->\n<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;border-collapse:collapse;background:${background};mso-table-lspace:0;mso-table-rspace:0"><tr><td height="56" align="center" valign="middle" bgcolor="${background}" style="height:56px;padding:0;text-align:center;vertical-align:middle;background:${background}"><table role="presentation" width="90" border="0" cellpadding="0" cellspacing="0" align="center" style="width:90px;margin:0 auto;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0"><tr><td width="90" height="30" align="center" valign="middle" style="width:90px;height:30px;padding:0;text-align:center;vertical-align:middle;font-size:0;line-height:0"><a href="${link}" target="_blank" aria-label="FunnyFuzzy" title="FunnyFuzzy" style="display:block;width:90px;height:30px;margin:0;padding:0;border:0;text-decoration:none;line-height:0;font-size:0">${logo}</a></td></tr></table></td></tr></table>`
}

export function buildLightweightBrandLogoEmailHtml(floor: FloorInstance, imageUrl: string) {
  const background = normalizeHex(floor.values.background, '#FFFFFF')
  const link = escapeAttribute(normalizeLink(floor.values.logoLink))
  return `<!-- FUNNYFUZZY 轻量 Logo：图片由 EDM EDITOR 同步至 Klaviyo；关闭图片时显示品牌替代文字。 -->\n<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;border-collapse:collapse;background:${background};mso-table-lspace:0;mso-table-rspace:0"><tr><td height="56" align="center" valign="middle" bgcolor="${background}" style="height:56px;padding:0;text-align:center;vertical-align:middle;background:${background}"><a href="${link}" target="_blank" aria-label="FunnyFuzzy" title="FunnyFuzzy" style="display:inline-block;width:90px;height:30px;margin:0;padding:0;border:0;text-decoration:none;line-height:0;font-size:0"><img src="${escapeAttribute(imageUrl)}" width="90" height="30" alt="FUNNY FUZZY" style="display:block;width:90px;height:30px;margin:0;border:0;color:${normalizeHex(floor.values.logoColor, '#000000')};font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;text-align:center" /></a></td></tr></table>`
}
