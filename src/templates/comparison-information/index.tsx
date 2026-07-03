import type { FloorRenderProps, MediaState, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import beforeIcon from '../../assets/comparison/Before.svg'
import afterIcon from '../../assets/comparison/After.svg'
import vsIcon from '../../assets/comparison/VS.svg'

const emptyMedia: MediaState = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

function ComparisonInformation({ floor, onMediaSlotChange }: FloorRenderProps) {
  const before = floor.mediaSlots?.before ?? emptyMedia
  const after = floor.mediaSlots?.after ?? emptyMedia
  const textColor = floor.values.textColor || '#000000'
  return <section className="floor-render comparison-information" data-testid="comparison-information" style={{ backgroundColor: floor.values.background || '#FFAC33', color: textColor }}>
    <header className="comparison-heading">
      <h2 style={{ color: textColor }}>{floor.values.title || 'A Better Spot for Every Ride'}</h2>
      {floor.values.description ? <p style={{ color: textColor }}>{floor.values.description}</p> : null}
    </header>
    <div className="comparison-media" data-testid="comparison-media">
      <div className="comparison-pane comparison-pane--before"><EditableImageFrame value={before} onChange={onMediaSlotChange ? value => onMediaSlotChange('before', value) : undefined} ariaLabel="Before 对比图片" placeholder="上传 Before 图片" designWidth={212} /></div>
      <div className="comparison-pane comparison-pane--after"><EditableImageFrame value={after} onChange={onMediaSlotChange ? value => onMediaSlotChange('after', value) : undefined} ariaLabel="After 对比图片" placeholder="上传 After 图片" designWidth={212} /></div>
      <img className="comparison-vs" src={vsIcon} alt="VS" />
    </div>
    <footer className="comparison-results">
      <ComparisonResult icon={beforeIcon} label="BEFORE" description={floor.values.beforeDescription} color={textColor} />
      <ComparisonResult icon={afterIcon} label="AFTER" description={floor.values.afterDescription} color={textColor} />
    </footer>
  </section>
}

function ComparisonResult({ icon, label, description, color }: { icon: string; label: string; description: string; color: string }) {
  return <div className="comparison-result"><strong style={{ color }}><img src={icon} alt="" />{label}</strong><p style={{ color }}>{description}</p></div>
}

export const comparisonInformation: RegisteredTemplate = {
  definition: {
    id: 'comparison-information', version: 1, name: '对比信息', category: 'information', designWidth: 375, designHeight: 420,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'beforeDescription', type: 'text', label: 'Before 描述', defaultValue: 'Scratched & Messy' },
      { id: 'afterDescription', type: 'text', label: 'After 描述', defaultValue: 'Neat & Protected' },
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFAC33' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
    ],
    themeColorFields: [{ fieldId: 'background', defaultSlot: 'C' }],
    mediaSlots: [{ id: 'before', label: 'Before 图片' }, { id: 'after', label: 'After 图片' }],
    autoHeight: true,
    productSlots: [], exportRegions: [{ id: 'full', name: '对比信息', x: 0, y: 0, width: 375, height: 420 }],
  }, Renderer: ComparisonInformation,
}
