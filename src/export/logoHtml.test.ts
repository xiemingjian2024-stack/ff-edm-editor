import { describe, expect, it } from 'vitest'
import { buildBrandLogoEmailHtml, buildLightweightBrandLogoEmailHtml } from './logoHtml'

describe('buildBrandLogoEmailHtml', () => {
  it('生成无需图片资源且带链接的邮件 HTML', () => {
    const html = buildBrandLogoEmailHtml({
      id: 'logo',
      templateId: 'head-brand-logo',
      values: { background: '#FFFFFF', logoColor: '#000000', logoLink: 'https://funnyfuzzy.com/collections/beds?from=email&slot=logo' },
      products: {},
    })

    expect(html).not.toMatch(/<img\b/i)
    expect(html).not.toMatch(/<svg\b/i)
    expect(html).toContain('width="90"')
    expect(html).toContain('height="56"')
    expect(html).toMatch(/<table[^>]*width="90"[^>]*align="center"/)
    expect(html).toContain('margin:0 auto')
    expect(html).toContain('href="https://funnyfuzzy.com/collections/beds?from=email&amp;slot=logo"')
    expect(html).toContain('bgcolor="#000000"')
    expect(html).toContain('bgcolor="#555555"')
    expect(html).toContain('bgcolor="#AAAAAA"')
  })

  it('生成使用在线 PNG 和替代文字的轻量 HTML', () => {
    const html = buildLightweightBrandLogoEmailHtml({ id: 'logo', templateId: 'head-brand-logo', values: { background: '#FFFFFF', logoColor: '#000000', logoLink: 'https://funnyfuzzy.com/' }, products: {} }, 'https://cdn.example/logo.png')
    expect(html).toContain('src="https://cdn.example/logo.png"')
    expect(html).toContain('alt="FUNNY FUZZY"')
    expect(new TextEncoder().encode(html).length).toBeLessThan(2000)
  })

  it('跟随楼层的背景和 Logo 颜色生成色块', () => {
    const html = buildBrandLogoEmailHtml({
      id: 'logo',
      templateId: 'head-brand-logo',
      values: { background: '#123456', logoColor: '#FFFFFF', logoLink: 'funnyfuzzy.com' },
      products: {},
    })

    expect(html).toContain('bgcolor="#123456"')
    expect(html).toContain('bgcolor="#FFFFFF"')
    expect(html).toContain('href="https://funnyfuzzy.com"')
  })
})
