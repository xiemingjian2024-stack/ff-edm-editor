import { useRef } from 'react'
import type { FloorInstance, MediaState, ProductValue, ThemePalette } from '../domain/edm'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getTemplate } from '../templates/registry'
import { Icon } from '../ui/Icon'
import { classicPalette } from '../themes/palettes'
import { getThemeFieldsForFloors, resolveFloorForRender } from '../themes/resolveThemeColor'

interface SortableFloorProps {
  floor: FloorInstance
  index: number
  palette: ThemePalette
  themeField: ReturnType<typeof getThemeFieldsForFloors>[string]
  selectedId: string | null
  onSelect: (id: string) => void
  onMediaChange?: (id: string, value: MediaState) => void
  onMediaSlotChange?: (id: string, slotId: string, value: MediaState) => void
  onProductChange?: (id: string, slotId: string, value: ProductValue) => void
}

function SortableFloor({ floor, index, palette, themeField, selectedId, onSelect, onMediaChange, onMediaSlotChange, onProductChange }: SortableFloorProps) {
  const entry = getTemplate(floor.templateId)
  const locked = floor.templateId === 'head-brand-logo' || floor.templateId === 'footer-links'
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: floor.id, disabled: locked })
  if (!entry) return null
  return <div ref={setNodeRef} data-floor-id={floor.id} className={`floor-frame ${selectedId === floor.id ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''} ${isOver && !isDragging ? 'is-drop-target' : ''}`} style={{ transform: CSS.Transform.toString(transform), transition }} onClick={() => onSelect(floor.id)}>
    <div className="floor-label"><button className="floor-drag-handle" {...attributes} {...listeners} disabled={locked} onClick={event => event.stopPropagation()} aria-label={locked ? `${entry.definition.name}位置固定` : `拖拽移动${entry.definition.name}`} title={locked ? '位置固定' : '按住拖拽调整顺序'}>{locked ? null : <Icon name="drag" size={14}/>}<span>{String(index + 1).padStart(2, '0')} · {entry.definition.name}</span></button></div>
    <entry.Renderer floor={resolveFloorForRender(floor, entry.definition, palette, themeField)} template={entry.definition} onMediaChange={floor.media && onMediaChange ? value => onMediaChange(floor.id, value) : undefined} onMediaSlotChange={floor.mediaSlots && onMediaSlotChange ? (slotId, value) => onMediaSlotChange(floor.id, slotId, value) : undefined} onProductChange={onProductChange ? (slotId, value) => onProductChange(floor.id, slotId, value) : undefined} />
  </div>
}

export function Canvas({ floors, palette = classicPalette, selectedId, zoom = 100, onZoomChange, onSelect, onReorder, onMediaChange, onMediaSlotChange, onProductChange }: { floors: FloorInstance[]; palette?: ThemePalette; selectedId: string | null; zoom?: number; onZoomChange?: (zoom: number) => void; onSelect: (id: string) => void; onReorder?: (id: string, overId: string) => void; onMediaChange?: (id: string, value: MediaState) => void; onMediaSlotChange?: (id: string, slotId: string, value: MediaState) => void; onProductChange?: (id: string, slotId: string, value: ProductValue) => void }) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const themeFields = getThemeFieldsForFloors(floors)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onReorder?.(String(active.id), String(over.id))
  }
  const fitCanvas = () => {
    const availableWidth = (scrollRef.current?.clientWidth ?? 475) - 80
    onZoomChange?.(Math.min(140, Math.max(60, Math.floor(availableWidth / 375 * 10) * 10)))
  }
  return <main className="canvas-area"><div className="canvas-topline"><span>EDM 画布</span><div className="zoom-tools"><button className="fit-canvas-button" type="button" onClick={fitCanvas}>适应窗口</button><div className="zoom-control"><button aria-label="缩小画布" onClick={() => onZoomChange?.(Math.max(60, zoom - 10))} disabled={zoom <= 60}><Icon name="minus"/></button><output>{zoom}%</output><button aria-label="放大画布" onClick={() => onZoomChange?.(Math.min(140, zoom + 10))} disabled={zoom >= 140}><Icon name="plus"/></button></div></div></div>
    <div className="canvas-scroll" ref={scrollRef}><div className="canvas-zoom-layer" style={{ transform: `scale(${zoom / 100})` }}><div className="edm-canvas" style={{ width: '375px' }}>
      {floors.length === 0 ? <div className="empty-canvas"><div className="empty-mark">＋</div><h2>从左侧添加第一个楼层</h2><p>Banner、标题和商品卡可以自由组合</p></div> : <DndContext sensors={sensors} collisionDetection={closestCenter} autoScroll onDragEnd={handleDragEnd}><SortableContext items={floors.map(floor => floor.id)} strategy={verticalListSortingStrategy}>{floors.map((floor, index) => <SortableFloor key={floor.id} floor={floor} index={index} palette={palette} themeField={themeFields[floor.id]} selectedId={selectedId} onSelect={onSelect} onMediaChange={onMediaChange} onMediaSlotChange={onMediaSlotChange} onProductChange={onProductChange}/>)}</SortableContext></DndContext>}
    </div></div></div>
  </main>
}
