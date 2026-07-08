import type { FloorRenderProps, MediaState, RegisteredTemplate } from '../../domain/edm'
import { EditableImageFrame } from '../../editor/EditableImageFrame'

const emptyMedia: MediaState = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

function HeadTopBanner({ floor, onMediaSlotChange }: FloorRenderProps) {
  const height = Math.min(250, Math.max(50, Number(floor.values.height) || 150))
  const media = floor.mediaSlots?.banner ?? emptyMedia
  return <section className="floor-render head-top-banner" data-testid="head-top-banner" style={{ height, backgroundColor: floor.values.background || '#FFFFFF' }}>
    <EditableImageFrame value={media} onChange={onMediaSlotChange ? value => onMediaSlotChange('banner', value) : undefined} ariaLabel="顶部横幅图片" designWidth={375} />
  </section>
}

export const headTopBanner: RegisteredTemplate = {
  definition: {
    id: 'head-top-banner', version: 1, name: '顶部横幅', category: 'head', designWidth: 375, designHeight: 150,
    fields: [
      { id: 'height', type: 'range', label: '图片高度', defaultValue: '150', min: 50, max: 250, step: 1, unit: 'px' },
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
    ],
    mediaSlots: [{ id: 'banner', label: '顶部横幅图片' }],
    heightConfig: { fieldId: 'height', min: 50, max: 250, offset: 0 },
    exportFullImage: false,
    productSlots: [],
    exportRegions: [{ id: 'full', name: 'HEAD 顶部横幅', x: 0, y: 0, width: 375, height: 150 }],
  },
  Renderer: HeadTopBanner,
}
