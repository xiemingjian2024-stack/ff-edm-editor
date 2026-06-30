import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'

function TitleCentered({ floor }: FloorRenderProps) {
  return <section className="floor-render title-centered" style={{ backgroundColor: floor.values.background }}>
    <h2 style={{ color: floor.values.textColor }}>{floor.values.title}</h2>
  </section>
}
export const titleCentered: RegisteredTemplate = {
  definition: {
    id: 'title-centered', version: 1, name: '标题居中', category: 'title', designWidth: 375, designHeight: 112,
    fields: [
      { id: 'title', type: 'text', label: '标题文案', defaultValue: 'Shop our favorites' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#171511' },
      { id: 'background', type: 'color', label: '背景色', defaultValue: '#fff8e9' }
    ], productSlots: [], exportRegions: [{ id: 'full', name: '整层', x: 0, y: 0, width: 375, height: 112 }]
  }, Renderer: TitleCentered
}
