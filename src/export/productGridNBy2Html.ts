import type { FloorInstance, TextHighlight } from '../domain/edm'

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const normalizeHex = (value: string | undefined, fallback: string) => /^[0-9a-f]{6}$/i.test(value?.trim().replace(/^#/, '') ?? '') ? `#${value!.trim().replace(/^#/, '').toUpperCase()}` : fallback
const normalizeLink = (value: string | undefined) => {
  const trimmed = value?.trim() ?? ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9.-]+(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return '#'
}

function highlightedText(value: string, highlight: TextHighlight | undefined) {
  if (!highlight?.enabled || !highlight.text) return escapeHtml(value)
  const index = value.indexOf(highlight.text)
  if (index < 0) return escapeHtml(value)
  const color = highlight.color ? `color:${normalizeHex(highlight.color, '')};` : ''
  return `${escapeHtml(value.slice(0, index))}<span style="${color}font-weight:700">${escapeHtml(highlight.text)}</span>${escapeHtml(value.slice(index + highlight.text.length))}`
}

function circleArrow(link: string) {
  return `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:26px;width:26px;v-text-anchor:middle" arcsize="50%" fillcolor="#303030" stroked="f"><w:anchorlock xmlns:w="urn:schemas-microsoft-com:office:word"/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:20px">&#8250;</center></v:roundrect><![endif]--><!--[if !mso]><!--><table role="presentation" width="26" border="0" cellpadding="0" cellspacing="0" style="width:26px;border-collapse:separate"><tr><td width="26" height="26" align="center" valign="middle" bgcolor="#303030" style="width:26px;height:26px;border-radius:50%;background:#303030;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:24px;text-align:center"><a href="${link}" target="_blank" aria-label="查看商品" style="display:block;width:26px;height:26px;color:#FFFFFF;line-height:24px;text-decoration:none">&#8250;</a></td></tr></table><!--<![endif]-->`
}

function productCard(floor: FloorInstance, index: number, imageUrl: string) {
  const product = floor.products[`product-${index + 1}`]
  const link = escapeHtml(normalizeLink(product?.url))
  const title = highlightedText(product?.title || `商品标题 ${index + 1}`, product?.titleHighlight)
  const price = `${floor.values.pricePrefix ? `${floor.values.pricePrefix} ` : ''}${product?.price || '--'}`
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="width:100%;border-collapse:separate;background:#FFFFFF;border-radius:4px">
  <tr><td bgcolor="#F0F0ED" style="padding:0;background:#F0F0ED;line-height:0"><a href="${link}" target="_blank" style="display:block;text-decoration:none"><img src="${escapeHtml(imageUrl)}" width="351" height="351" alt="" style="display:block;width:100%;height:auto;margin:0;border:0" /></a></td></tr>
  <tr><td height="60" valign="top" style="height:60px;padding:12px 10px 8px;color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;line-height:15px;overflow-wrap:break-word"><a href="${link}" target="_blank" style="color:#000000;text-decoration:none">${title}</a></td></tr>
  <tr><td style="padding:0 10px 7px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr><td valign="middle" style="color:#000000;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:15px;white-space:nowrap"><a href="${link}" target="_blank" style="color:#000000;text-decoration:none">${escapeHtml(price)}</a></td><td width="26" valign="middle" align="right">${circleArrow(link)}</td></tr></table></td></tr>
</table>`
}

export function buildProductGridNBy2EmailHtml(floor: FloorInstance, imageUrls: string[]) {
  const count = Math.max(2, Math.min(8, Number.parseInt(floor.values.productCount || '2', 10) || 2))
  const background = normalizeHex(floor.values.background, '#FFFFFF')
  const textColor = normalizeHex(floor.values.textColor, '#000000')
  const rows: string[] = []
  for (let index = 0; index < count; index += 2) {
    rows.push(`<tr><td width="50%" valign="top" style="width:50%;padding:0 4px 8px 0">${productCard(floor, index, imageUrls[index] || '')}</td><td width="50%" valign="top" style="width:50%;padding:0 0 8px 4px">${productCard(floor, index + 1, imageUrls[index + 1] || '')}</td></tr>`)
  }
  const title = escapeHtml(floor.values.title || '')
  const description = escapeHtml(floor.values.description || '')
  const buttonText = floor.values.buttonText?.trim() || ''
  const buttonLink = escapeHtml(normalizeLink(floor.values.buttonLink))
  return `<!-- FUNNYFUZZY N×2 商品卡：图片由 EDM EDITOR 同步至 Klaviyo；商品信息与圆形箭头为邮件 HTML。 -->
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;max-width:100%;border-collapse:collapse;table-layout:fixed;background:${background};mso-table-lspace:0;mso-table-rspace:0">
  <tr><td align="center" bgcolor="${background}" style="padding:28px 24px 24px;background:${background};color:${textColor};font-family:Arial,Helvetica,sans-serif;text-align:center"><div style="margin:0;color:${textColor};font-size:20px;font-weight:700;line-height:24px">${title}</div>${description ? `<div style="margin:10px 0 0;color:${textColor};font-size:14px;line-height:19px">${description}</div>` : ''}</td></tr>
  <tr><td style="padding:0 8px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed">${rows.join('')}</table></td></tr>
  ${buttonText ? `<tr><td align="center" style="padding:12px 8px 24px"><table role="presentation" width="182" border="0" cellpadding="0" cellspacing="0" align="center" style="width:${floor.values.buttonWidth === 'full' ? '100%' : '182px'};border-collapse:collapse"><tr><td height="34" align="center" bgcolor="${normalizeHex(floor.values.buttonBackground, '#000000')}" style="height:34px;background:${normalizeHex(floor.values.buttonBackground, '#000000')};text-align:center"><a href="${buttonLink}" target="_blank" style="display:block;color:${normalizeHex(floor.values.buttonTextColor, '#FFFFFF')};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:34px;text-decoration:none">${escapeHtml(buttonText)}</a></td></tr></table></td></tr>` : '<tr><td height="16" style="height:16px;line-height:16px">&nbsp;</td></tr>'}
</table>`
}
