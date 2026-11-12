import type { FloorInstance, TextHighlight } from '../domain/edm'

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const normalizeHex = (value: string | undefined, fallback: string) => /^[0-9a-f]{6}$/i.test(value?.trim().replace(/^#/, '') ?? '') ? `#${value!.trim().replace(/^#/, '').toUpperCase()}` : fallback
const normalizeLink = (value: string | undefined) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return '#'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9.-]+(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return '#'
}

function highlightedText(value: string, highlight: TextHighlight | undefined, baseSize: number) {
  if (!highlight?.enabled || !highlight.text) return escapeHtml(value)
  const index = value.indexOf(highlight.text)
  if (index < 0) return escapeHtml(value)
  const color = highlight.color ? `color:${normalizeHex(highlight.color, '')};` : ''
  return `${escapeHtml(value.slice(0, index))}<span style="${color}font-weight:700;font-size:${baseSize + 4}px">${escapeHtml(highlight.text)}</span>${escapeHtml(value.slice(index + highlight.text.length))}`
}

export function buildBannerImageCopyEmailHtml(floor: FloorInstance, imageUrl: string) {
  const values = floor.values
  const background = normalizeHex(values.background, '#FFFFFF')
  const textColor = normalizeHex(values.textColor, '#000000')
  const buttonBackground = normalizeHex(values.buttonBackground, '#000000')
  const buttonTextColor = normalizeHex(values.buttonTextColor, '#FFFFFF')
  const alignment = values.alignment === 'left' || values.alignment === 'right' ? values.alignment : 'center'
  const link = escapeHtml(normalizeLink(floor.media?.url))
  const title = highlightedText(values.title || '', floor.textHighlights?.title, 40)
  const description = highlightedText(values.description || '', floor.textHighlights?.description, 28)
  const buttonWidth = values.buttonWidth === 'full' ? '100%' : '364'
  const buttonAlign = alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'center'

  return `<!-- FUNNYFUZZY 图文 Banner：图片由 EDM EDITOR 同步至 Klaviyo，文字与按钮为邮件 HTML。 -->
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;max-width:750px;border-collapse:collapse;background:${background};mso-table-lspace:0;mso-table-rspace:0">
  <tr><td style="padding:0;line-height:0"><a href="${link}" target="_blank" style="display:block;text-decoration:none"><img src="${escapeHtml(imageUrl)}" width="750" alt="${escapeHtml(values.title || 'FunnyFuzzy')}" style="display:block;width:100%;max-width:750px;height:auto;margin:0;border:0" /></a></td></tr>
  <tr><td align="${alignment}" bgcolor="${background}" style="min-height:360px;padding:48px;background:${background};color:${textColor};font-family:Arial,Helvetica,sans-serif;text-align:${alignment}">
    <div style="margin:0;color:${textColor};font-size:40px;font-weight:700;line-height:48px">${title}</div>
    ${values.description ? `<div style="margin:20px 0 0;color:${textColor};font-size:28px;line-height:38px">${description}</div>` : ''}
    <table role="presentation" width="${buttonWidth}" border="0" cellpadding="0" cellspacing="0" align="${buttonAlign}" style="${values.buttonWidth === 'full' ? 'width:100%;' : 'width:364px;'}margin-top:28px;border-collapse:collapse"><tr><td height="68" align="center" bgcolor="${buttonBackground}" style="height:68px;padding:0 48px;background:${buttonBackground};text-align:center"><a href="${link}" target="_blank" style="display:block;color:${buttonTextColor};font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:68px;text-decoration:none;white-space:nowrap">${escapeHtml(values.buttonText || '')}</a></td></tr></table>
  </td></tr>
</table>`
}
