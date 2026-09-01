import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'
import brandLogo from '../../assets/footer/v2/brand-logo.png'
import facebookIcon from '../../assets/footer/v2/facebook.png'
import instagramIcon from '../../assets/footer/v2/instagram.png'
import qualityIcon from '../../assets/footer/v2/quality-guarantee.png'
import returnsIcon from '../../assets/footer/v2/returns-30-days.png'
import secureIcon from '../../assets/footer/v2/secure-checkout.png'
import tiktokIcon from '../../assets/footer/v2/tiktok.png'

const defaultItems = ['Shop All', 'Contact Us', 'FAQ', 'Privacy Policy'].map(text => ({ text, url: '' }))

function FooterLinks({ floor }: FloorRenderProps) {
  const items = defaultItems.map((fallback, index) => floor.navigationItems?.[index] ?? fallback)
  const background = floor.values.background || '#FFAC33'
  return <section className="floor-render footer-links" data-testid="footer-links" style={{ backgroundColor: background }}>
    <div className="footer-trust-region" data-export-region-id="trust">
      <div className="footer-trust-item"><img src={qualityIcon} alt=""/><span>Quality<br/>Guarantee</span></div>
      <div className="footer-trust-item"><img src={secureIcon} alt=""/><span>Secure<br/>Checkout</span></div>
      <div className="footer-trust-item"><img src={returnsIcon} alt=""/><span>30-Day<br/>Returns</span></div>
    </div>
    <div className="footer-links-list">
      {items.map((item, index) => <div className="footer-link-region" data-testid="footer-link" data-export-region-id={`link-${index + 1}`} key={index}><span>{item.text}</span></div>)}
    </div>
    <div className="footer-brand-region" data-export-region-id="brand"><img src={brandLogo} alt="FunnyFuzzy" /></div>
    <div className="footer-social-list">
      <div className="footer-social-region" data-testid="footer-social" data-export-region-id="social-instagram"><img src={instagramIcon} alt="Instagram" /></div>
      <div className="footer-social-region" data-testid="footer-social" data-export-region-id="social-tiktok"><img src={tiktokIcon} alt="TikTok" /></div>
      <div className="footer-social-region" data-testid="footer-social" data-export-region-id="social-facebook"><img src={facebookIcon} alt="Facebook" /></div>
    </div>
    <div className="footer-address-region" data-export-region-id="address">
      <span>FUNNYFUZZY US LTD</span>
      <span>522 W RIVERSIDE AVE STE N SPOKANE, WA 99201</span>
      <span>93-2489811 (Not a return address)</span>
    </div>
  </section>
}

export const footerLinks: RegisteredTemplate = {
  definition: {
    id: 'footer-links', version: 2, name: '页尾', category: 'footer', designWidth: 375, designHeight: 315,
    fields: [{ id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFAC33' }],
    navigationConfig: { minItems: 4, maxItems: 4, defaultItems },
    autoHeight: true, domExportRegions: true, exportFullImage: false, productSlots: [],
    exportRegions: [
      { id: 'trust', name: '页尾保障信息', x: 0, y: 0, width: 375, height: 1 },
      ...defaultItems.map((item, index) => ({ id: `link-${index + 1}`, name: item.text, x: 0, y: 0, width: 1, height: 1, navigationItemIndex: index })),
      { id: 'brand', name: '页尾品牌 Logo', x: 0, y: 0, width: 375, height: 1 },
      { id: 'social-instagram', name: 'Instagram', x: 0, y: 0, width: 1, height: 1 },
      { id: 'social-tiktok', name: 'TikTok', x: 0, y: 0, width: 1, height: 1 },
      { id: 'social-facebook', name: 'Facebook', x: 0, y: 0, width: 1, height: 1 },
      { id: 'address', name: '页尾公司信息', x: 0, y: 0, width: 375, height: 1 },
    ],
  },
  Renderer: FooterLinks,
}
