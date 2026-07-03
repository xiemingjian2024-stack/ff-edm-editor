import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import { getProductMedia, withProductMedia } from '../../domain/productMedia'

const productSlots = Array.from({ length: 3 }, (_, index) => ({ id: `product-${index + 1}`, label: `商品 ${index + 1}`, showPrice: false }))

function ProductGridNBy3({ floor, onProductChange }: FloorRenderProps) {
  const textColor = floor.values.textColor || '#000000'
  const cardBackground = floor.values.cardBackground || '#EEEEEE'
  return <section className="floor-render product-grid-n-by-3" data-testid="product-grid-n-by-3" style={{ backgroundColor: floor.values.background || '#FFFFFF', color: textColor }}>
    <header className="product-grid-heading" data-export-region-id="header"><h2 style={{ color: textColor }}>{floor.values.title}</h2>{floor.values.description ? <p style={{ color: textColor }}>{floor.values.description}</p> : null}</header>
    <div className="product-grid-n-by-3-list">{productSlots.map((slot, index) => {
      const product = floor.products[slot.id]
      return <article className="product-grid-n-by-3-card" data-testid="product-grid-n-by-3-card" data-export-region-id={`item-${index + 1}`} key={slot.id} style={{ backgroundColor: cardBackground }}>
        <div className="product-grid-n-by-3-image" style={{ backgroundColor: cardBackground }}><EditableImageFrame value={getProductMedia(product)} onChange={product && onProductChange ? media => onProductChange(slot.id, withProductMedia(product, media)) : undefined} ariaLabel={`N×3 商品卡 商品 ${index + 1} 图片`} designWidth={117} fit="contain" /></div>
        <div className="product-grid-n-by-3-copy">
          <span className="product-grid-n-by-3-stars" aria-label="5 星" style={{ color: floor.values.starColor || '#FFAC33' }}>★★★★★</span>
          <h3 className="product-grid-n-by-3-title">{product?.title || `商品标题 ${index + 1}`}</h3>
          {floor.values.cardButtonText ? <span className="product-grid-n-by-3-card-button" style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.cardButtonText}</span> : null}
        </div>
      </article>
    })}</div>
    {floor.values.buttonText ? <span className="banner-button non-banner-button product-grid-n-by-3-main-button" data-export-region-id="button" style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
  </section>
}

export const productGridNBy3: RegisteredTemplate = {
  definition: {
    id: 'product-grid-n-by-3', version: 1, name: 'N×3 商品卡', category: 'product-card', designWidth: 375, designHeight: 520,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '主按钮文案', defaultValue: 'Shop Now' },
      { id: 'cardButtonText', type: 'text', label: '商品卡按钮文案', defaultValue: 'SHOP NOW' },
      { id: 'background', type: 'color', label: '楼层背景颜色', defaultValue: '#FFFFFF' },
      { id: 'cardBackground', type: 'color', label: '商品卡背景颜色', defaultValue: '#EEEEEE' },
      { id: 'starColor', type: 'color', label: '星星颜色', defaultValue: '#FFAC33' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    themeColorFields: [{ fieldId: 'background', defaultSlot: 'A' }],
    productSlots, domExportRegions: true, autoHeight: true, exportFullImage: false,
    exportRegions: [
      { id: 'header', name: '标题与描述', x: 0, y: 0, width: 1, height: 1 },
      ...productSlots.map((slot, index) => ({ id: `item-${index + 1}`, name: `商品 ${index + 1}`, x: 0, y: 0, width: 1, height: 1, linkSlotId: slot.id })),
      { id: 'button', name: '底部按钮', x: 0, y: 0, width: 1, height: 1 },
    ],
  },
  Renderer: ProductGridNBy3,
}
