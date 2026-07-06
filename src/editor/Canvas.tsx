import type { FloorInstance, MediaState, ProductValue, ThemePalette } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { Icon } from '../ui/Icon'
import { classicPalette } from '../themes/palettes'
import { getThemeFieldsForFloors, resolveFloorForRender } from '../themes/resolveThemeColor'

export function Canvas({ floors, palette = classicPalette, selectedId, zoom = 100, onZoomChange, onSelect, onMove, onMediaChange, onMediaSlotChange, onProductChange }: { floors: FloorInstance[]; palette?: ThemePalette; selectedId: string | null; zoom?: number; onZoomChange?: (zoom: number) => void; onSelect: (id: string) => void; onMove: (id: string, direction: -1 | 1) => void; onMediaChange?: (id: string, value: MediaState) => void; onMediaSlotChange?: (id: string, slotId: string, value: MediaState) => void; onProductChange?: (id: string, slotId: string, value: ProductValue) => void }) {
  const themeFields = getThemeFieldsForFloors(floors)
  return <main className="canvas-area"><div className="canvas-topline"><span>EDM 画布</span><div className="zoom-control"><button aria-label="缩小画布" onClick={() => onZoomChange?.(Math.max(80, zoom - 20))} disabled={zoom <= 80}><Icon name="minus"/></button><output>{zoom}%</output><button aria-label="放大画布" onClick={() => onZoomChange?.(Math.min(120, zoom + 20))} disabled={zoom >= 120}><Icon name="plus"/></button></div></div>
    <div className="canvas-scroll"><div className="canvas-zoom-layer" style={{ transform: `scale(${zoom / 100})` }}><div className="edm-canvas" style={{ width: '375px' }}>
      {floors.length === 0 ? <div className="empty-canvas"><div className="empty-mark">＋</div><h2>从左侧添加第一个楼层</h2><p>Banner、标题和商品卡可以自由组合</p></div> : floors.map((floor, index) => {
        const entry = getTemplate(floor.templateId); if (!entry) return null
        return <div data-floor-id={floor.id} className={`floor-frame ${selectedId === floor.id ? 'is-selected' : ''}`} key={floor.id} onClick={() => onSelect(floor.id)}>
          <div className="floor-label"><span>{String(index + 1).padStart(2, '0')} · {entry.definition.name}</span><div><button onClick={(event) => { event.stopPropagation(); onMove(floor.id, -1) }} disabled={index === 0} aria-label="上移楼层"><Icon name="up" size={14}/></button><button onClick={(event) => { event.stopPropagation(); onMove(floor.id, 1) }} disabled={index === floors.length - 1} aria-label="下移楼层"><Icon name="down" size={14}/></button></div></div>
          <entry.Renderer floor={resolveFloorForRender(floor, entry.definition, palette, themeFields[floor.id])} template={entry.definition} onMediaChange={floor.media && onMediaChange ? value => onMediaChange(floor.id, value) : undefined} onMediaSlotChange={floor.mediaSlots && onMediaSlotChange ? (slotId, value) => onMediaSlotChange(floor.id, slotId, value) : undefined} onProductChange={onProductChange ? (slotId, value) => onProductChange(floor.id, slotId, value) : undefined} />
        </div>
      })}
    </div></div></div>
  </main>
}
