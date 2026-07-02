import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import { getFloorHeight } from '../floorGeometry'

function BannerImageCopy({ floor, template, onMediaChange }: FloorRenderProps) {
  const imageHeight = Math.min(500, Math.max(200, Number(floor.values.imageHeight) || 300))
  const height = getFloorHeight(template, floor)
  const alignment = floor.values.alignment || 'center'
  return <section className="floor-render banner-image-copy" data-testid="banner-image-copy" style={{ height, backgroundColor: floor.values.background }}>
    <div className="banner-image-stage" data-testid="banner-image-stage" style={{ height: imageHeight }}>{floor.media ? <EditableImageFrame value={floor.media} onChange={onMediaChange} ariaLabel="图文 Banner 图片" /> : null}</div>
    <div className="banner-copy banner-copy--panel" data-testid="banner-copy" style={{ textAlign: alignment as 'left' | 'center' | 'right' }}>
      <h2 style={{ color: floor.values.textColor }}>{floor.values.title}</h2>
      {floor.values.description ? <p style={{ color: floor.values.textColor }}>{floor.values.description}</p> : null}
      <span className="banner-button" style={{ backgroundColor: floor.values.buttonBackground, color: floor.values.buttonTextColor, alignSelf: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>{floor.values.buttonText}</span>
    </div>
  </section>
}

export const bannerImageCopy: RegisteredTemplate = {
  definition: {
    id: 'banner-image-copy', version: 1, name: '图文 Banner', category: 'banner', designWidth: 375, designHeight: 480,
    fields: [
      { id: 'imageHeight', type: 'range', label: '图片区域高度', defaultValue: '300', min: 200, max: 500, step: 1, unit: 'px' },
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '按钮文案', defaultValue: 'SHOP NOW' },
      { id: 'alignment', type: 'choice', label: '对齐方式', defaultValue: 'center', options: [{ label: '左对齐', value: 'left' }, { label: '居中', value: 'center' }, { label: '右对齐', value: 'right' }] },
      { id: 'background', type: 'color', label: '文案区背景颜色', defaultValue: '#FFFFFF' },
      { id: 'textColor', type: 'color', label: '标题与描述颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    themeColorFields: [{ fieldId: 'background', defaultSlot: 'A' }, { fieldId: 'textColor', defaultSlot: 'B' }, { fieldId: 'buttonBackground', defaultSlot: 'B' }, { fieldId: 'buttonTextColor', defaultSlot: 'A' }],
    mediaConfig: { frameHeightFieldId: 'imageHeight' }, heightConfig: { fieldId: 'imageHeight', min: 200, max: 500, offset: 180 },
    productSlots: [], exportRegions: [{ id: 'full', name: '图文 Banner', x: 0, y: 0, width: 375, height: 480, mediaLink: true }],
  }, Renderer: BannerImageCopy,
}
