import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'

function TitleCentered({ floor }: FloorRenderProps) {
  const alignment = floor.values.alignment || 'center'
  const alignSelf = alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'
  return <section className="floor-render title-content" data-testid="title-content" data-alignment={alignment} style={{ backgroundColor: floor.values.background || '#FFFFFF', textAlign: alignment as 'left' | 'center' | 'right' }}>
    {floor.values.title ? <h2 style={{ color: floor.values.textColor || '#000000' }}>{floor.values.title}</h2> : null}
    {floor.values.description ? <p style={{ color: floor.values.textColor || '#000000' }}>{floor.values.description}</p> : null}
    {floor.values.buttonText ? <span className="banner-button non-banner-button" style={{ alignSelf, backgroundColor: floor.values.buttonBackground || '#000000', color: floor.values.buttonTextColor || '#FFFFFF' }}>{floor.values.buttonText}</span> : null}
  </section>
}
export const titleCentered: RegisteredTemplate = {
  definition: {
    id: 'title-centered', version: 2, name: '常规标题', category: 'title', designWidth: 375, designHeight: 200,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '按钮文案', defaultValue: 'SHOP NOW' },
      { id: 'alignment', type: 'choice', label: '对齐方式', defaultValue: 'center', options: [{ label: '左对齐', value: 'left' }, { label: '居中', value: 'center' }, { label: '右对齐', value: 'right' }] },
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
      { id: 'textColor', type: 'color', label: '标题与描述颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    autoHeight: true, exportFullImage: false, productSlots: [], exportRegions: [{ id: 'full', name: '常规标题', x: 0, y: 0, width: 375, height: 200 }]
  }, Renderer: TitleCentered
}
