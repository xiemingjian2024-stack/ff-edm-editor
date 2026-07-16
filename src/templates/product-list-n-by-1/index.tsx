import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { getActiveProductSlots } from '../productSlots'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import { getProductMedia, withProductMedia } from '../../domain/productMedia'
import { buttonWidthClass, buttonWidthField } from '../buttonWidth'
import { floorText, renderHighlightedText } from '../../text/HighlightedText'

function ProductListNBy1({ floor, template, onProductChange }: FloorRenderProps) {
  const textColor = floor.values.textColor || '#000000'
  const slots = getActiveProductSlots(template, floor)
  return <section className="floor-render product-list-n-by-1" data-testid="product-list-n-by-1" style={{ backgroundColor: floor.values.background || '#FFFFFF', color: textColor }}>
    <header className="product-grid-heading" data-export-region-id="header"><h2 style={{ color: textColor }}>{floorText(floor, 'title')}</h2>{floor.values.description ? <p style={{ color: textColor }}>{floorText(floor, 'description')}</p> : null}</header>
    <div className="product-list-n-items">{slots.map((slot, index) => {
      const product = floor.products[slot.id]
      const cardBackground = floor.values[`cardBackground${index + 1}`] || ['#F6E2CC', '#E1DEE8', '#E3F1FF', '#FFDAD0'][index]
      return <article className={`product-list-n-card ${index % 2 === 0 ? 'is-image-left' : 'is-image-right'}`} data-testid="product-list-n-card" data-export-region-id={`item-${index + 1}`} key={slot.id} style={{ backgroundColor: cardBackground }}>
        <div className="product-list-n-image" data-testid="product-list-n-image" style={{ backgroundColor: cardBackground }}><EditableImageFrame value={getProductMedia(product)} onChange={product && onProductChange ? media => onProductChange(slot.id, withProductMedia(product, media)) : undefined} ariaLabel={`N×1 商品卡 商品 ${index + 1} 图片`} designWidth={181.5} fit="contain" /></div>
        <div className="product-list-n-copy" style={{ color: textColor }}>
          <h3>{renderHighlightedText(product?.title || `商品标题 ${index + 1}`, product?.titleHighlight)}</h3>
          <p>{floor.values.pricePrefix ? `${floor.values.pricePrefix} ` : ''}{product?.price || '--'}</p>
          {floor.values.cardButtonText ? <span className={`product-list-n-card-button${buttonWidthClass(floor.values.buttonWidth)}`} style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.cardButtonText}</span> : null}
        </div>
      </article>
    })}</div>
    {floor.values.buttonText ? <span className={`banner-button non-banner-button product-list-n-main-button${buttonWidthClass(floor.values.buttonWidth)}`} data-export-region-id="button" style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
  </section>
}

const productSlots = Array.from({ length: 4 }, (_, index) => ({ id: `product-${index + 1}`, label: `商品 ${index + 1}` }))
const exportRegions = [
  { id: 'header', name: '标题与描述', x: 0, y: 0, width: 1, height: 1 },
  ...productSlots.map((slot, index) => ({ id: `item-${index + 1}`, name: `商品 ${index + 1}`, x: 0, y: 0, width: 1, height: 1, linkSlotId: slot.id })),
  { id: 'button', name: '底部按钮', x: 0, y: 0, width: 1, height: 1 },
]

export const productListNBy1: RegisteredTemplate = {
  definition: {
    id: 'product-list-n-by-1', version: 1, name: 'N×1 商品卡', category: 'product-card', designWidth: 375, designHeight: 760,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '主按钮文案', defaultValue: 'See More' },
      { id: 'cardButtonText', type: 'text', label: '商品卡按钮文案', defaultValue: 'Shop Now' },
      buttonWidthField,
      { id: 'productCount', type: 'choice', label: '商品数量', defaultValue: '1', options: [{ label: '1 个商品', value: '1' }, { label: '2 个商品', value: '2' }, { label: '3 个商品', value: '3' }, { label: '4 个商品', value: '4' }] },
      { id: 'pricePrefix', type: 'text', label: '价格前缀', defaultValue: 'From' },
      { id: 'background', type: 'color', label: '楼层背景颜色', defaultValue: '#FFFFFF' },
      { id: 'cardBackground1', type: 'color', label: '商品卡 1 背景颜色', defaultValue: '#F6E2CC' },
      { id: 'cardBackground2', type: 'color', label: '商品卡 2 背景颜色', defaultValue: '#E1DEE8' },
      { id: 'cardBackground3', type: 'color', label: '商品卡 3 背景颜色', defaultValue: '#E3F1FF' },
      { id: 'cardBackground4', type: 'color', label: '商品卡 4 背景颜色', defaultValue: '#FFDAD0' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    productSlots, productSlotCountFieldId: 'productCount', domExportRegions: true, autoHeight: true, exportFullImage: false, exportRegions,
  },
  Renderer: ProductListNBy1,
}
