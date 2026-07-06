import footerShowcase from '../../assets/footer/footer-showcase.jpg'
import footerCopy from '../../assets/footer/footer-copy.jpg'
import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'

const linkOptions = Array.from({ length: 6 }, (_, index) => ({ label: `${index + 1} 个链接`, value: String(index + 1) }))
const defaultItems = ['HOME', 'Travel Carriers', 'Sofa Covers', 'Dog Beds', 'Blankets', 'New Arrivals'].map(text => ({ text, url: '' }))

function FooterLinks({ floor }: FloorRenderProps) {
  const count = Math.min(6, Math.max(1, Number(floor.values.navigationCount) || 3))
  return <section className="floor-render footer-links" data-testid="footer-links">
    <img className="footer-links-showcase" data-testid="footer-showcase" data-export-region-id="showcase" src={footerShowcase} alt="" />
    <div className="footer-links-list">
      {(floor.navigationItems ?? []).slice(0, count).map((item, index) => <div className="footer-link-region" data-testid="footer-link" data-export-region-id={`link-${index + 1}`} key={index}><span>{item.text}</span></div>)}
    </div>
    <img className="footer-links-copy" data-testid="footer-copy" data-export-region-id="copy" src={footerCopy} alt="" />
  </section>
}

export const footerLinks: RegisteredTemplate = {
  definition: {
    id: 'footer-links', version: 1, name: '页尾', category: 'footer', designWidth: 375, designHeight: 812,
    fields: [{ id: 'navigationCount', type: 'choice', label: '链接数量', defaultValue: '3', options: linkOptions }],
    navigationConfig: { minItems: 1, maxItems: 6, defaultItems },
    autoHeight: true, domExportRegions: true, exportFullImage: false, productSlots: [],
    exportRegions: [
      { id: 'showcase', name: '页尾展示区', x: 0, y: 0, width: 375, height: 1 },
      ...defaultItems.map((item, index) => ({ id: `link-${index + 1}`, name: item.text, x: 0, y: 0, width: 375, height: 1, navigationItemIndex: index })),
      { id: 'copy', name: '页尾文案', x: 0, y: 0, width: 375, height: 1 },
    ],
  },
  Renderer: FooterLinks,
}
