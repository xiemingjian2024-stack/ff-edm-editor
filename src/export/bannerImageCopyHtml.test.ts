import { expect, it } from 'vitest'
import { buildBannerImageCopyEmailHtml } from './bannerImageCopyHtml'

it('图文 Banner 使用在线图片并把文字与按钮保留为 HTML', () => {
  const html = buildBannerImageCopyEmailHtml({
    id: 'banner', templateId: 'banner-image-copy', products: {},
    values: { title: 'A Better Spot', description: 'Soft & safe', buttonText: 'Shop Now', buttonWidth: 'auto', alignment: 'center', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#FFAC33', buttonTextColor: '#000000' },
    textHighlights: { description: { enabled: true, text: 'safe', color: '#FFAC33' } },
    media: { image: 'local.jpg', url: 'https://funnyfuzzy.com/products/bed', scale: 1, offsetX: 0, offsetY: 0 },
  }, 'https://cdn.example/banner.jpg')
  expect(html).toContain('src="https://cdn.example/banner.jpg"')
  expect(html).toContain('href="https://funnyfuzzy.com/products/bed"')
  expect(html).toContain('Soft &amp; <span')
  expect(html).toContain('background:#FFAC33')
  expect(html).not.toContain('local.jpg')
})
