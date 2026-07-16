import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { floorText } from '../../text/HighlightedText'

function BannerSimple({ floor }: FloorRenderProps) {
  const image = floor.values.image
  return <section className="floor-render banner-simple" style={{ backgroundColor: floor.values.background, backgroundImage: image ? `url(${image})` : undefined }}>
    <h2 style={{ color: floor.values.textColor }}>{floorText(floor, 'title')}</h2>
  </section>
}

export const bannerSimple: RegisteredTemplate = {
  definition: {
    id: 'banner-simple', version: 1, name: '夏日主视觉', category: 'banner', designWidth: 375, designHeight: 250,
    hiddenInLibrary: true,
    fields: [
      { id: 'title', type: 'text', label: '主标题', defaultValue: 'MAKE EVERY DAY A LITTLE MORE FUN' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#ffffff' },
      { id: 'background', type: 'color', label: '背景色', defaultValue: '#ffac33' },
      { id: 'image', type: 'image', label: '主视觉图片', defaultValue: '' }
    ], productSlots: [], exportRegions: [{ id: 'full', name: '整层', x: 0, y: 0, width: 375, height: 250 }]
  }, Renderer: BannerSimple
}
