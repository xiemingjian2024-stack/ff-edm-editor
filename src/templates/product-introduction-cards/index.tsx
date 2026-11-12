import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import { getProductMedia, withProductMedia } from '../../domain/productMedia'
import { floorText, renderHighlightedText } from '../../text/HighlightedText'
import { buttonWidthClass, buttonWidthField } from '../buttonWidth'
import { getActiveProductSlots } from '../productSlots'

const productSlots = Array.from({ length: 5 }, (_, index) => ({
  id: `product-${index + 1}`,
  label: `商品 ${index + 1}`,
  showPrice: true,
  showDescription: true,
  showActionText: true,
  defaultActionText: 'Shop Now',
}))

function ProductIntroductionCards({ floor, template, onProductChange }: FloorRenderProps) {
  const textColor = floor.values.textColor || '#000000'
  const cardBackground = floor.values.cardBackground || '#F3F3F3'
  const slots = getActiveProductSlots(template, floor)

  return <section className="floor-render product-introduction-cards" data-testid="product-introduction-cards" style={{ backgroundColor: floor.values.background || '#FFFFFF', color: textColor }}>
    <header className="product-grid-heading" data-export-region-id="header">
      <h2 style={{ color: textColor }}>{floorText(floor, 'title')}</h2>
      {floor.values.description ? <p style={{ color: textColor }}>{floorText(floor, 'description')}</p> : null}
    </header>
    <div className="product-introduction-list">
      {slots.map((slot, index) => {
        const product = floor.products[slot.id]
        const actionText = product?.actionText === undefined ? (floor.values.cardButtonText ?? slot.defaultActionText ?? '') : product.actionText
        const actionLabel = actionText.trim() || product?.price?.trim() || ''
        return <article className={`product-introduction-card ${index % 2 === 0 ? 'is-image-left' : 'is-image-right'}`} data-testid="product-introduction-card" data-export-region-id={`item-${index + 1}`} key={slot.id} style={{ backgroundColor: cardBackground }}>
          <div className="product-introduction-image" style={{ backgroundColor: cardBackground }}>
            <EditableImageFrame value={getProductMedia(product)} onChange={product && onProductChange ? media => onProductChange(slot.id, withProductMedia(product, media)) : undefined} ariaLabel={`产品介绍卡 商品 ${index + 1} 图片`} designWidth={179.5} fit="cover" />
          </div>
          <div className="product-introduction-copy" style={{ color: textColor }}>
            <h3>{renderHighlightedText(product?.title || `商品标题 ${index + 1}`, product?.titleHighlight)}</h3>
            {product?.description ? <p>{renderHighlightedText(product.description, product.descriptionHighlight)}</p> : null}
            {actionLabel ? <span className="product-introduction-card-action"><span>{actionLabel}</span><span className="product-introduction-html-arrow" aria-hidden="true">›</span></span> : null}
          </div>
        </article>
      })}
    </div>
    {floor.values.buttonText ? <span className={`banner-button non-banner-button product-introduction-main-button${buttonWidthClass(floor.values.buttonWidth)}`} data-export-region-id="button" style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
  </section>
}

export const productIntroductionCards: RegisteredTemplate = {
  definition: {
    id: 'product-introduction-cards', version: 2, name: '产品介绍卡', category: 'product-card', designWidth: 375, designHeight: 1120,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '底部按钮文案', defaultValue: 'Shop Now' },
      { id: 'buttonLink', type: 'text', label: '底部按钮链接', defaultValue: '' },
      buttonWidthField,
      { id: 'productCount', type: 'choice', label: '商品数量', defaultValue: '1', options: [
        { label: '1 个商品', value: '1' }, { label: '2 个商品', value: '2' }, { label: '3 个商品', value: '3' }, { label: '4 个商品', value: '4' }, { label: '5 个商品', value: '5' },
      ] },
      { id: 'background', type: 'color', label: '楼层背景颜色', defaultValue: '#FFFFFF' },
      { id: 'cardBackground', type: 'color', label: '商品卡面板颜色', defaultValue: '#F3F3F3' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    productSlots,
    productSlotCountFieldId: 'productCount',
    domExportRegions: true,
    autoHeight: true,
    exportFullImage: false,
    exportRegions: [
      { id: 'header', name: '标题与描述', x: 0, y: 0, width: 1, height: 1 },
      ...productSlots.map((slot, index) => ({ id: `item-${index + 1}`, name: `商品 ${index + 1}`, x: 0, y: 0, width: 1, height: 1, linkSlotId: slot.id })),
      { id: 'button', name: '底部按钮', x: 0, y: 0, width: 1, height: 1, linkFieldId: 'buttonLink', linkRequiredFieldId: 'buttonText' },
    ],
  },
  Renderer: ProductIntroductionCards,
}
