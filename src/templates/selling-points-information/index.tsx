import type { FieldDefinition, FloorRenderProps, MediaState, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'

const emptyMedia: MediaState = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }
const defaults = [
  ['360° Snug Comfort', 'A cushioned, wraparound spot that helps ease travel anxiety.'],
  ['Sponge Support', 'Soft, steady support to help them settle in for every ride.'],
  ['Secure for Every Trip', 'A stable shape helps pets feel supported while the car is moving.'],
  ['Easy Everyday Care', 'Practical materials make daily cleanup and upkeep feel effortless.'],
]

export function SellingPointsInformation({ floor, onMediaSlotChange }: FloorRenderProps) {
  const count = floor.values.itemCount === '4' ? 4 : 2
  const textColor = floor.values.textColor || '#000000'
  return <section className="floor-render selling-points-information" data-testid="selling-points-information" style={{ backgroundColor: floor.values.background || '#FFFFFF', color: textColor }}>
    <header className="selling-points-heading">
      <h2 style={{ color: textColor }}>{floor.values.title || 'A Better Spot for Every Ride'}</h2>
      {floor.values.description ? <p style={{ color: textColor }}>{floor.values.description}</p> : null}
    </header>
    <div className="selling-points-grid">
      {Array.from({ length: count }, (_, index) => {
        const id = `point${index + 1}`
        const media = floor.mediaSlots?.[id] ?? emptyMedia
        return <article className="selling-point" data-testid="selling-point" key={id}>
          <div className="selling-point-media" data-testid="selling-point-media"><EditableImageFrame value={media} onChange={onMediaSlotChange ? value => onMediaSlotChange(id, value) : undefined} ariaLabel={`卖点 ${index + 1} 图片`} placeholder={`上传卖点 ${index + 1} 图片`} designWidth={184} /></div>
          <div className="selling-point-copy"><h3 style={{ color: textColor }}>{floor.values[`${id}Title`]}</h3><p style={{ color: textColor }}>{floor.values[`${id}Description`]}</p></div>
        </article>
      })}
    </div>
    {floor.values.buttonText ? <span className="banner-button non-banner-button selling-points-button" style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
  </section>
}

const pointFields: FieldDefinition[] = defaults.flatMap(([title, description], index) => [
  { id: `point${index + 1}Title`, type: 'text', label: `卖点 ${index + 1} 标题`, defaultValue: title },
  { id: `point${index + 1}Description`, type: 'text', label: `卖点 ${index + 1} 描述`, defaultValue: description },
])

export const sellingPointsInformation: RegisteredTemplate = {
  definition: {
    id: 'selling-points-information', version: 1, name: '多卖点信息', category: 'information', designWidth: 375, designHeight: 390,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '按钮文案', defaultValue: 'Shop Now' },
      { id: 'itemCount', type: 'choice', label: '卖点数量', defaultValue: '2', options: [{ label: '2 个卖点', value: '2' }, { label: '4 个卖点', value: '4' }] },
      ...pointFields,
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    themeColorFields: [{ fieldId: 'background', defaultSlot: 'A' }],
    mediaSlots: Array.from({ length: 4 }, (_, index) => ({ id: `point${index + 1}`, label: `卖点 ${index + 1} 图片` })),
    mediaSlotCountFieldId: 'itemCount', autoHeight: true, productSlots: [], exportRegions: [{ id: 'full', name: '多卖点信息', x: 0, y: 0, width: 375, height: 390 }],
  }, Renderer: SellingPointsInformation,
}
