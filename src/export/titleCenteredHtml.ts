import type { FloorInstance, TextHighlight } from '../domain/edm'

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const normalizeHex = (value: string | undefined, fallback: string) => /^[0-9a-f]{6}$/i.test(value?.trim().replace(/^#/, '') ?? '') ? `#${value!.trim().replace(/^#/, '').toUpperCase()}` : fallback
const normalizeLink = (value: string | undefined) => {
  const trimmed = value?.trim() ?? ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9.-]+(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return '#'
}

function highlightedText(value: string, highlight: TextHighlight | undefined, baseSize: number) {
  if (!highlight?.enabled || !highlight.text) return escapeHtml(value)
  const index = value.indexOf(highlight.text)
  if (index < 0) return escapeHtml(value)
  const color = highlight.color ? `color:${normalizeHex(highlight.color, '')};` : ''
  return `${escapeHtml(value.slice(0, index))}<span style="${color}font-weight:700;font-size:${baseSize + 2}px">${escapeHtml(highlight.text)}</span>${escapeHtml(value.slice(index + highlight.text.length))}`
}

export function buildTitleCenteredEmailHtml(floor: FloorInstance) {
  const values = floor.values
  const background = normalizeHex(values.background, '#FFFFFF')
  const textColor = normalizeHex(values.textColor, '#000000')
  const buttonBackground = normalizeHex(values.buttonBackground, '#000000')
  const buttonTextColor = normalizeHex(values.buttonTextColor, '#FFFFFF')
  const alignment = values.alignment === 'left' || values.alignment === 'right' ? values.alignment : 'center'
  const title = highlightedText(values.title || '', floor.textHighlights?.title, 20)
  const descriptionSize = values.descriptionSize === 'large' ? 18 : 14
  const description = highlightedText(values.description || '', floor.textHighlights?.description, descriptionSize)
  const buttonWidth = values.buttonWidth === 'full' ? '100%' : '182'
  const buttonAlign = alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'center'
  const button = values.buttonText?.trim() ? `<table role="presentation" width="${buttonWidth}" border="0" cellpadding="0" cellspacing="0" align="${buttonAlign}" style="${values.buttonWidth === 'full' ? 'width:100%;' : 'width:182px;'}margin:20px ${buttonAlign === 'center' ? 'auto 0' : buttonAlign === 'right' ? '0 0 0 auto' : '0 auto 0 0'};border-collapse:collapse;table-layout:fixed;mso-table-lspace:0;mso-table-rspace:0"><tr><td height="34" align="center" bgcolor="${buttonBackground}" style="height:34px;padding:0;background:${buttonBackground};text-align:center"><a href="${escapeHtml(normalizeLink(values.buttonLink))}" target="_blank" style="display:block;color:${buttonTextColor};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:34px;text-decoration:none;white-space:nowrap">${escapeHtml(values.buttonText)}</a></td></tr></table>` : ''

  return `<!-- FUNNYFUZZY 常规标题：纯邮件 HTML；按钮文案为空时不输出按钮及链接。 -->
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;max-width:100%;border-collapse:collapse;table-layout:fixed;background:${background};mso-table-lspace:0;mso-table-rspace:0"><tr><td align="${alignment}" bgcolor="${background}" style="padding:24px;background:${background};color:${textColor};font-family:Arial,Helvetica,sans-serif;text-align:${alignment};overflow-wrap:break-word;word-break:normal">
  ${values.title ? `<div style="margin:0;color:${textColor};font-size:20px;font-weight:700;line-height:24px;overflow-wrap:break-word;word-break:normal">${title}</div>` : ''}
  ${values.description ? `<div style="margin:14px 0 0;color:${textColor};font-size:${descriptionSize}px;line-height:${values.descriptionSize === 'large' ? 24 : 20}px;overflow-wrap:break-word;word-break:normal">${description}</div>` : ''}
  ${button}
</td></tr></table>`
}
