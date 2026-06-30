import type { FloorInstance } from '../domain/edm'
import { getTemplate } from '../templates/registry'

export function Canvas({ floors, selectedId, onSelect, onMove }: { floors: FloorInstance[]; selectedId: string | null; onSelect: (id: string) => void; onMove: (id: string, direction: -1 | 1) => void }) {
  return <main className="canvas-area"><div className="canvas-toolbar"><div><strong>画布</strong><span>375 px · 100%</span></div><span>自动保存</span></div>
    <div className="canvas-scroll"><div className="edm-canvas">
      {floors.length === 0 ? <div className="empty-canvas"><div className="empty-mark">＋</div><h2>从左侧添加第一个楼层</h2><p>Banner、标题和商品卡可以自由组合</p></div> : floors.map((floor, index) => {
        const entry = getTemplate(floor.templateId); if (!entry) return null
        return <div className={`floor-frame ${selectedId === floor.id ? 'is-selected' : ''}`} key={floor.id} onClick={() => onSelect(floor.id)}>
          <div className="floor-label"><span>{String(index + 1).padStart(2, '0')} · {entry.definition.name}</span><div><button onClick={(event) => { event.stopPropagation(); onMove(floor.id, -1) }} disabled={index === 0} aria-label="上移楼层">↑</button><button onClick={(event) => { event.stopPropagation(); onMove(floor.id, 1) }} disabled={index === floors.length - 1} aria-label="下移楼层">↓</button></div></div>
          <entry.Renderer floor={floor} template={entry.definition} />
        </div>
      })}
    </div></div>
  </main>
}
