import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import { floorText } from '../../text/HighlightedText'

function CodeInformation({ floor }: FloorRenderProps) {
  const background = floor.values.background || '#FFFFFF'
  const accent = floor.values.accentColor || '#FFAC33'
  return <section className="floor-render code-information" data-testid="code-information" style={{ backgroundColor: background }}>
    <header className="code-information-top" data-testid="code-information-top" data-export-region-id="top"><h2 className="code-information-title">{floorText(floor, 'topText')}</h2></header>
    <div className="code-information-placeholder" data-testid="code-information-placeholder"><span>CODE</span></div>
    <footer className="code-information-bottom" data-testid="code-information-bottom" data-export-region-id="bottom">
      <div className="code-information-action" style={{ color: accent }}>
        <i className="code-information-line" style={{ backgroundColor: accent }} />
        <strong className="code-information-action-text">{floor.values.actionText}</strong>
        <i className="code-information-arrow" style={{ borderColor: accent }} />
        <i className="code-information-line" style={{ backgroundColor: accent }} />
      </div>
      <p className="code-information-note">{floorText(floor, 'noteText')}</p>
    </footer>
  </section>
}

export const codeInformation: RegisteredTemplate = {
  definition: {
    id: 'code-information', version: 1, name: 'CODE', category: 'information', designWidth: 375, designHeight: 200,
    fields: [
      { id: 'topText', type: 'text', label: '顶部文案', defaultValue: 'Copy Your Code' },
      { id: 'actionText', type: 'text', label: '行动文案', defaultValue: 'SAVE NOW' },
      { id: 'noteText', type: 'text', label: '说明文案', defaultValue: '*Selected Summer Cooling Products Only' },
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
      { id: 'accentColor', type: 'color', label: '强调颜色', defaultValue: '#FFAC33' },
    ],
    exportFullImage: false,
    productSlots: [],
    exportRegions: [
      { id: 'top', name: 'CODE 顶部', x: 0, y: 0, width: 375, height: 60 },
      { id: 'bottom', name: 'CODE 底部', x: 0, y: 116, width: 375, height: 84 },
    ],
  },
  Renderer: CodeInformation,
}
