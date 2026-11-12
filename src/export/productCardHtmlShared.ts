import type { TextHighlight } from '../domain/edm'

export const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
export const normalizeHex = (value: string | undefined, fallback: string) => /^[0-9a-f]{6}$/i.test(value?.trim().replace(/^#/, '') ?? '') ? `#${value!.trim().replace(/^#/, '').toUpperCase()}` : fallback
export const normalizeLink = (value: string | undefined) => {
  const trimmed = value?.trim() ?? ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9.-]+(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return '#'
}
export function highlightedText(value: string, highlight?: TextHighlight) {
  if (!highlight?.enabled || !highlight.text) return escapeHtml(value)
  const index = value.indexOf(highlight.text)
  if (index < 0) return escapeHtml(value)
  const color = highlight.color ? `color:${normalizeHex(highlight.color, '')};` : ''
  return `${escapeHtml(value.slice(0, index))}<span style="${color}font-weight:700">${escapeHtml(highlight.text)}</span>${escapeHtml(value.slice(index + highlight.text.length))}`
}
export function circleArrow(link: string, size = 24) {
  const fontSize = size === 24 ? 19 : 20
  return `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:${size}px;width:${size}px;v-text-anchor:middle" arcsize="50%" fillcolor="#303030" stroked="f"><w:anchorlock xmlns:w="urn:schemas-microsoft-com:office:word"/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:${fontSize}px">&#8250;</center></v:roundrect><![endif]--><!--[if !mso]><!--><table role="presentation" width="${size}" border="0" cellpadding="0" cellspacing="0" style="width:${size}px;border-collapse:separate"><tr><td width="${size}" height="${size}" align="center" valign="middle" bgcolor="#303030" style="width:${size}px;height:${size}px;border-radius:50%;background:#303030;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:${size - 2}px;text-align:center"><a href="${link}" target="_blank" aria-label="查看商品" style="display:block;width:${size}px;height:${size}px;color:#FFFFFF;line-height:${size - 2}px;text-decoration:none">&#8250;</a></td></tr></table><!--<![endif]-->`
}
export function headingHtml(title: string, description: string, background: string, textColor: string) {
  return `<tr><td align="center" bgcolor="${background}" style="padding:28px 24px 24px;background:${background};color:${textColor};font-family:Arial,Helvetica,sans-serif;text-align:center"><div style="margin:0;color:${textColor};font-size:20px;font-weight:700;line-height:24px">${escapeHtml(title)}</div>${description ? `<div style="margin:10px 0 0;color:${textColor};font-size:14px;line-height:19px">${escapeHtml(description)}</div>` : ''}</td></tr>`
}
export function mainButtonHtml(text: string, linkValue: string | undefined, widthValue: string | undefined, backgroundValue: string | undefined, colorValue: string | undefined, sidePadding: number) {
  if (!text.trim()) return `<tr><td height="16" style="height:16px;line-height:16px">&nbsp;</td></tr>`
  const background = normalizeHex(backgroundValue, '#000000')
  const color = normalizeHex(colorValue, '#FFFFFF')
  const width = widthValue === 'full' ? '100%' : '182px'
  return `<tr><td align="center" style="padding:14px ${sidePadding}px 24px;text-align:center"><table role="presentation" width="182" border="0" cellpadding="0" cellspacing="0" align="center" style="width:${width};margin:0 auto;border-collapse:collapse"><tr><td height="34" align="center" bgcolor="${background}" style="height:34px;background:${background};text-align:center"><a href="${escapeHtml(normalizeLink(linkValue))}" target="_blank" style="display:block;color:${color};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:34px;text-decoration:none">${escapeHtml(text)}</a></td></tr></table></td></tr>`
}
