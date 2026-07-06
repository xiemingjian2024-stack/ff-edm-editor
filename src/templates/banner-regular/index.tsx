import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import { getFloorHeight } from '../floorGeometry'
import { useBannerFrame } from '../useBannerFrame'

function BannerRegular({ floor, template, onMediaChange }: FloorRenderProps) {
  const height = getFloorHeight(template, floor)
  const position = floor.values.copyPosition === 'top' ? 'top' : 'bottom'
  const media = useBannerFrame(floor.animation, floor.media!)
  return <section className="floor-render banner-regular" data-testid="banner-regular" style={{ height }}>
    {floor.media ? <EditableImageFrame value={media} onChange={floor.animation?.enabled ? undefined : onMediaChange} ariaLabel="常规 Banner 图片" /> : null}
    {floor.values.overlay === 'on' ? <div className={`banner-gradient banner-gradient--${position}`} data-testid="banner-overlay" /> : null}
    <BannerCopy floor={floor} position={position} />
  </section>
}

function BannerCopy({ floor, position }: { floor: FloorRenderProps['floor']; position: 'top' | 'bottom' }) {
  const alignment = floor.values.alignment || 'center'
  return <div className="banner-copy banner-copy--overlay" data-testid="banner-copy" data-position={position} style={{ textAlign: alignment as 'left' | 'center' | 'right', [position]: 24 }}>
    <h2 style={{ color: floor.values.textColor }}>{floor.values.title}</h2>
    {floor.values.description ? <p style={{ color: floor.values.textColor }}>{floor.values.description}</p> : null}
    <span className="banner-button" style={{ backgroundColor: floor.values.buttonBackground, color: floor.values.buttonTextColor, alignSelf: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>{floor.values.buttonText}</span>
  </div>
}

export const bannerRegular: RegisteredTemplate = {
  definition: {
    id: 'banner-regular', version: 1, name: '常规 Banner', category: 'banner', designWidth: 375, designHeight: 375,
    fields: [
      { id: 'height', type: 'range', label: '楼层高度', defaultValue: '375', min: 250, max: 600, step: 1, unit: 'px' },
      { id: 'title', type: 'text', label: '标题', defaultValue: 'Spend Less Time Cleaning' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Protect your sofa from spills, scratches and everyday mess' },
      { id: 'buttonText', type: 'text', label: '按钮文案', defaultValue: 'SHOP NOW' },
      { id: 'copyPosition', type: 'choice', label: '文案位置', defaultValue: 'bottom', options: [{ label: '顶部', value: 'top' }, { label: '底部', value: 'bottom' }] },
      { id: 'alignment', type: 'choice', label: '对齐方式', defaultValue: 'center', options: [{ label: '左对齐', value: 'left' }, { label: '居中', value: 'center' }, { label: '右对齐', value: 'right' }] },
      { id: 'overlay', type: 'choice', label: '渐变遮罩', defaultValue: 'on', options: [{ label: '开启遮罩', value: 'on' }, { label: '关闭遮罩', value: 'off' }] },
      { id: 'textColor', type: 'color', label: '标题与描述颜色', defaultValue: '#FFFFFF' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#FFAC33' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    mediaConfig: {}, heightConfig: { fieldId: 'height', min: 250, max: 600, offset: 0 },
    productSlots: [], exportRegions: [{ id: 'full', name: '常规 Banner', x: 0, y: 0, width: 375, height: 375, mediaLink: true }],
  }, Renderer: BannerRegular,
}
