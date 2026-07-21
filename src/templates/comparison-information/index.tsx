import type { FloorRenderProps, MediaState, RegisteredTemplate, TextHighlight } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'
import beforeIcon from '../../assets/comparison/Before.svg'
import afterIcon from '../../assets/comparison/After.svg'
import vsIcon from '../../assets/comparison/VS.svg'
import { floorText, renderHighlightedText } from '../../text/HighlightedText'
import { buttonWidthClass, buttonWidthField } from '../buttonWidth'

const emptyMedia: MediaState = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

function ComparisonInformation({ floor, onMediaSlotChange }: FloorRenderProps) {
  const before = floor.mediaSlots?.before ?? emptyMedia
  const after = floor.mediaSlots?.after ?? emptyMedia
  const textColor = floor.values.textColor || '#000000'
  const bottomStyle = floor.values.bottomStyle === 'action' ? 'action' : 'comparison'
  return <section className={`floor-render comparison-information comparison-information--${bottomStyle}`} data-testid="comparison-information" style={{ backgroundColor: floor.values.background || '#FFAC33', color: textColor }}>
    <header className="comparison-heading">
      <h2 style={{ color: textColor }}>{floorText(floor, 'title', 'A Better Spot for Every Ride')}</h2>
      {floor.values.description ? <p style={{ color: textColor }}>{floorText(floor, 'description')}</p> : null}
    </header>
    <div className="comparison-media" data-testid="comparison-media">
      <div className="comparison-pane comparison-pane--before"><EditableImageFrame value={before} onChange={onMediaSlotChange ? value => onMediaSlotChange('before', value) : undefined} ariaLabel="Before 对比图片" designWidth={212} /></div>
      <div className="comparison-pane comparison-pane--after"><EditableImageFrame value={after} onChange={onMediaSlotChange ? value => onMediaSlotChange('after', value) : undefined} ariaLabel="After 对比图片" designWidth={212} /></div>
      {bottomStyle === 'comparison' ? <img className="comparison-vs" src={vsIcon} alt="VS" /> : null}
    </div>
    {bottomStyle === 'comparison' ? <footer className="comparison-results">
        <ComparisonResult icon={beforeIcon} label="BEFORE" description={floor.values.beforeDescription} highlight={floor.textHighlights?.beforeDescription} color={textColor} />
        <ComparisonResult icon={afterIcon} label="AFTER" description={floor.values.afterDescription} highlight={floor.textHighlights?.afterDescription} color={textColor} />
      </footer> : <footer className="comparison-action">
        {floor.values.actionDescription ? <p style={{ color: textColor }}>{floorText(floor, 'actionDescription')}</p> : null}
        {floor.values.buttonText ? <span className={`banner-button non-banner-button comparison-action-button${buttonWidthClass(floor.values.buttonWidth)}`} style={{ backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
      </footer>}
  </section>
}

function ComparisonResult({ icon, label, description, highlight, color }: { icon: string; label: string; description: string; highlight?: TextHighlight; color: string }) {
  return <div className="comparison-result"><strong style={{ color }}><img src={icon} alt="" />{label}</strong><p style={{ color }}>{renderHighlightedText(description, highlight)}</p></div>
}

export const comparisonInformation: RegisteredTemplate = {
  definition: {
    id: 'comparison-information', version: 1, name: '对比信息', category: 'information', designWidth: 375, designHeight: 420,
    fields: [
      { id: 'bottomStyle', type: 'choice', label: '底部样式', defaultValue: 'comparison', options: [{ label: '前后说明', value: 'comparison' }, { label: '行动引导', value: 'action' }] },
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'beforeDescription', type: 'text', label: 'Before 描述', defaultValue: 'Scratched & Messy' },
      { id: 'afterDescription', type: 'text', label: 'After 描述', defaultValue: 'Neat & Protected' },
      { id: 'actionDescription', type: 'text', label: '底部文案', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '按钮文案（可不填）', defaultValue: 'Shop Now' },
      buttonWidthField,
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFAC33' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    mediaSlots: [{ id: 'before', label: 'Before 图片' }, { id: 'after', label: 'After 图片' }],
    autoHeight: true, exportFullImage: false,
    productSlots: [], exportRegions: [{ id: 'full', name: '对比信息', x: 0, y: 0, width: 375, height: 420 }],
  }, Renderer: ComparisonInformation,
}
