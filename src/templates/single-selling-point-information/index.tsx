import type { FloorRenderProps, MediaState, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'

const emptyMedia: MediaState = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

export function SingleSellingPointInformation({ floor, onMediaSlotChange }: FloorRenderProps) {
  const imageHeight = Math.min(300, Math.max(100, Number(floor.values.imageHeight) || 200))
  const textColor = floor.values.textColor || '#000000'
  const media = floor.mediaSlots?.feature ?? emptyMedia
  return <section className="floor-render single-selling-point-information" data-testid="single-selling-point-information" style={{ backgroundColor: floor.values.background || '#FFFFFF', color: textColor }}>
    <header className="selling-points-heading">
      <h2 style={{ color: textColor }}>{floor.values.title || 'A Better Spot for Every Ride'}</h2>
      {floor.values.description ? <p style={{ color: textColor }}>{floor.values.description}</p> : null}
    </header>
    <div className="single-selling-point-media" data-testid="single-selling-point-media" style={{ height: imageHeight }}>
      <EditableImageFrame value={media} onChange={onMediaSlotChange ? value => onMediaSlotChange('feature', value) : undefined} ariaLabel="卖点图片" placeholder="上传卖点图片" />
    </div>
    {floor.values.buttonText ? <span className="banner-button non-banner-button single-selling-point-button" style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
  </section>
}

export const singleSellingPointInformation: RegisteredTemplate = {
  definition: {
    id: 'single-selling-point-information', version: 1, name: '单卖点信息', category: 'information', designWidth: 375, designHeight: 390,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '按钮文案', defaultValue: 'Shop Now' },
      { id: 'imageHeight', type: 'range', label: '图片高度', defaultValue: '200', min: 100, max: 300, step: 1, unit: 'px' },
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    themeColorFields: [{ fieldId: 'background', defaultSlot: 'A' }, { fieldId: 'textColor', defaultSlot: 'B' }, { fieldId: 'buttonBackground', defaultSlot: 'B' }, { fieldId: 'buttonTextColor', defaultSlot: 'A' }],
    mediaSlots: [{ id: 'feature', label: '卖点图片' }],
    autoHeight: true,
    productSlots: [], exportRegions: [{ id: 'full', name: '单卖点信息', x: 0, y: 0, width: 375, height: 390 }],
  },
  Renderer: SingleSellingPointInformation,
}
