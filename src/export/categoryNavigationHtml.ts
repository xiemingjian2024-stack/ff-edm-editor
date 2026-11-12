import type { FloorInstance } from '../domain/edm'

const DEFAULT_ITEMS = [
  { text: 'Home', url: 'https://funnyfuzzy.com/' },
  { text: 'Carrier & Travel', url: 'https://funnyfuzzy.com/collections/travel-1' },
  { text: 'Couch Covers', url: 'https://funnyfuzzy.com/collections/couch-cover' },
  { text: 'New Category', url: '' },
]

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const normalizeHex = (value: string | undefined, fallback: string) => {
  const candidate = value?.trim().replace(/^#/, '') ?? ''
  return /^[0-9a-f]{6}$/i.test(candidate) ? `#${candidate.toUpperCase()}` : fallback
}

const mixHex = (foreground: string, background: string, foregroundRatio = 0.35) => {
  const channel = (index: number) => Math.round(
    Number.parseInt(foreground.slice(index, index + 2), 16) * foregroundRatio
    + Number.parseInt(background.slice(index, index + 2), 16) * (1 - foregroundRatio),
  ).toString(16).padStart(2, '0').toUpperCase()
  return `#${channel(1)}${channel(3)}${channel(5)}`
}

const normalizeLink = (value: string | undefined) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return '#'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9.-]+(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return '#'
}

export function buildCategoryNavigationEmailHtml(floor: FloorInstance) {
  const count = Math.min(4, Math.max(2, Number(floor.values.navigationCount) || 3))
  const background = normalizeHex(floor.values.background, '#FFFFFF')
  const textColor = normalizeHex(floor.values.textColor, '#000000')
  const dividerColor = mixHex(textColor, background)
  const width = `${100 / count}%`
  const cells = Array.from({ length: count }, (_, index) => {
    const current = floor.navigationItems?.[index]
    const item = { ...DEFAULT_ITEMS[index], ...current, url: current?.url?.trim() || DEFAULT_ITEMS[index].url }
    const divider = index < count - 1 ? `<td width="1" align="center" valign="middle" style="width:1px;padding:0;text-align:center;vertical-align:middle;font-size:0;line-height:0"><table role="presentation" width="1" height="10" border="0" cellpadding="0" cellspacing="0" align="center" style="width:1px;height:10px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0;mso-table-rspace:0"><tr><td width="1" height="10" bgcolor="${dividerColor}" style="width:1px;height:10px;padding:0;background:${dividerColor};font-size:0;line-height:0">&nbsp;</td></tr></table></td>` : ''
    return `<td width="${width}" height="46" align="center" valign="middle" bgcolor="${background}" style="width:${width};height:46px;padding:0;background:${background};text-align:center;vertical-align:middle"><table role="presentation" width="100%" height="46" border="0" cellpadding="0" cellspacing="0" style="width:100%;height:46px;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0"><tr><td align="center" valign="middle" style="padding:0 12px;text-align:center;vertical-align:middle"><a href="${escapeHtml(normalizeLink(item.url))}" target="_blank" style="display:block;color:${textColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:13px;text-decoration:none">${escapeHtml(item.text)}</a></td>${divider}</tr></table></td>`
  }).join('')

  return `<!-- FUNNYFUZZY 分类导航：每一项均为独立链接，不依赖图片。 -->\n<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;height:46px;border-collapse:collapse;background:${background};table-layout:fixed;mso-table-lspace:0;mso-table-rspace:0"><tr>${cells}</tr></table>`
}
