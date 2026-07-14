import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { getActiveProductSlots } from '../productSlots'
import arrowIcon from '../../assets/product-card/跳转.svg'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import { getProductMedia, withProductMedia } from '../../domain/productMedia'
import { buttonWidthClass, buttonWidthField } from '../buttonWidth'

function ProductGridNBy2({ floor, template, onProductChange }: FloorRenderProps) {
  const textColor = floor.values.textColor || '#000000'
  const slots = getActiveProductSlots(template, floor)
  return <section className="floor-render product-grid-n-by-2" data-testid="product-grid-n-by-2" style={{ backgroundColor: floor.values.background || '#FFFFFF', color: textColor }}>
    <header className="product-grid-heading" data-export-region-id="header"><h2 style={{ color: textColor }}>{floor.values.title}</h2>{floor.values.description ? <p style={{ color: textColor }}>{floor.values.description}</p> : null}</header>
    <div className="product-grid-n-list">{slots.map((slot, index) => { const product = floor.products[slot.id]; return <article className="product-grid-n-card" data-testid="product-grid-n-card" data-export-region-id={`item-${index + 1}`} key={slot.id}>
      <div className="product-grid-n-image"><EditableImageFrame value={getProductMedia(product)} onChange={product && onProductChange ? media => onProductChange(slot.id, withProductMedia(product, media)) : undefined} ariaLabel={`N×2 商品卡 商品 ${index + 1} 图片`} designWidth={175.5} fit="cover" /></div>
      <h3>{product?.title || `商品标题 ${index + 1}`}</h3>
      <div className="product-grid-n-price"><span>{floor.values.pricePrefix ? `${floor.values.pricePrefix} ` : ''}{product?.price || '--'}</span><img src={arrowIcon} alt="" /></div>
    </article> })}</div>
    {floor.values.buttonText ? <span className={`banner-button non-banner-button product-grid-n-button${buttonWidthClass(floor.values.buttonWidth)}`} data-export-region-id="button" style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
  </section>
}

const productSlots = Array.from({ length: 8 }, (_, index) => ({ id: `product-${index + 1}`, label: `商品 ${index + 1}` }))
const exportRegions = [
  { id: 'header', name: '标题与描述', x: 0, y: 0, width: 1, height: 1 },
  ...productSlots.map((slot, index) => ({ id: `item-${index + 1}`, name: `商品 ${index + 1}`, x: 0, y: 0, width: 1, height: 1, linkSlotId: slot.id })),
  { id: 'button', name: '底部按钮', x: 0, y: 0, width: 1, height: 1 },
]

export const productGridNBy2: RegisteredTemplate = {
  definition: {
    id: 'product-grid-n-by-2', version: 1, name: 'N×2 商品卡', category: 'product-card', designWidth: 375, designHeight: 1200,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '按钮文案', defaultValue: 'See More' },
      buttonWidthField,
      { id: 'productCount', type: 'choice', label: '商品数量', defaultValue: '2', options: [{ label: '2 个商品', value: '2' }, { label: '4 个商品', value: '4' }, { label: '6 个商品', value: '6' }, { label: '8 个商品', value: '8' }] },
      { id: 'pricePrefix', type: 'text', label: '价格前缀', defaultValue: 'From' },
      { id: 'background', type: 'color', label: '楼层背景颜色', defaultValue: '#FFFFFF' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    productSlots, productSlotCountFieldId: 'productCount', domExportRegions: true, autoHeight: true, exportFullImage: false, exportRegions,
  }, Renderer: ProductGridNBy2,
}
