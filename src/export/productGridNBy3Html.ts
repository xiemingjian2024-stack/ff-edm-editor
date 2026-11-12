import type { FloorInstance } from '../domain/edm'
import { escapeHtml, headingHtml, highlightedText, mainButtonHtml, normalizeHex, normalizeLink } from './productCardHtmlShared'

function card(floor: FloorInstance, index: number, imageUrl: string) {
  const product = floor.products[`product-${index + 1}`]
  const link = escapeHtml(normalizeLink(product?.url))
  const background = normalizeHex(floor.values.cardBackground, '#EEEEEE')
  const textColor = normalizeHex(floor.values.textColor, '#000000')
  const button = floor.values.cardButtonText?.trim() ? `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;border-collapse:collapse;table-layout:fixed"><tr><td height="30" align="center" bgcolor="${normalizeHex(floor.values.buttonBackground, '#000000')}" style="height:30px;background:${normalizeHex(floor.values.buttonBackground, '#000000')};text-align:center"><a href="${link}" target="_blank" style="display:block;overflow:hidden;color:${normalizeHex(floor.values.buttonTextColor, '#FFFFFF')};font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:30px;text-decoration:none;white-space:nowrap;text-overflow:ellipsis">${escapeHtml(floor.values.cardButtonText)}</a></td></tr></table>` : ''
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;border-collapse:collapse;table-layout:fixed;background:${background};border-radius:4px;overflow:hidden"><tr><td style="padding:0;line-height:0"><a href="${link}" target="_blank" style="display:block;text-decoration:none;line-height:0"><img src="${escapeHtml(imageUrl)}" width="234" height="234" alt="" style="display:block;width:100%;height:auto;margin:0;border:0" /></a></td></tr><tr><td align="center" style="padding:10px 10px 12px;text-align:center"><div style="display:block;overflow:hidden;color:${normalizeHex(floor.values.starColor, '#FFAC33')};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:15px;letter-spacing:1px;white-space:nowrap">★★★★★</div><div style="display:block;width:100%;max-width:100%;overflow:hidden;margin-top:10px;color:${textColor};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:15px;white-space:nowrap;text-overflow:ellipsis"><a href="${link}" target="_blank" style="display:block;width:100%;max-width:100%;overflow:hidden;color:${textColor};text-decoration:none;white-space:nowrap;text-overflow:ellipsis">${highlightedText(product?.title || `商品标题 ${index + 1}`, product?.titleHighlight)}</a></div>${button}</td></tr></table>`
}

export function buildProductGridNBy3EmailHtml(floor: FloorInstance, imageUrls: string[]) {
  const background = normalizeHex(floor.values.background, '#FFFFFF')
  const cards = [0, 1, 2].map((index) => {
    const padding = index === 0 ? 'padding:0 3px 0 0' : index === 1 ? 'padding:0 3px' : 'padding:0 0 0 3px'
    return `<td width="33.33%" valign="top" style="display:table-cell!important;width:33.33%!important;${padding}">${card(floor, index, imageUrls[index] || '')}</td>`
  }).join('')
  return `<!-- FUNNYFUZZY N×3 商品卡：图片同步至 Klaviyo，商品信息与按钮为邮件 HTML。 --><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${background}" style="width:100%;border-collapse:collapse;table-layout:fixed;background:${background};mso-table-lspace:0;mso-table-rspace:0">${headingHtml(floor.values.title || '', floor.values.description || '', background, normalizeHex(floor.values.textColor, '#000000'))}<tr><td style="padding:0 6px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed"><tr style="display:table-row!important">${cards}</tr></table></td></tr>${mainButtonHtml(floor.values.buttonText || '', floor.values.buttonLink, floor.values.buttonWidth, floor.values.buttonBackground, floor.values.buttonTextColor, 6)}</table>`
}
