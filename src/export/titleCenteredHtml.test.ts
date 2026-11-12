import { describe, expect, it } from 'vitest'
import { buildTitleCenteredEmailHtml } from './titleCenteredHtml'

const floor = (buttonText: string, buttonLink = 'https://funnyfuzzy.com/collections/beds') => ({
  id: 'title', templateId: 'title-centered', products: {},
  values: { title: 'A Better Spot', description: 'Comfort for every ride', buttonText, buttonLink, buttonWidth: 'auto', descriptionSize: 'small', alignment: 'center', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#FFAC33', buttonTextColor: '#000000' },
})

describe('常规标题 HTML', () => {
  it('按钮有文案时输出独立链接', () => {
    const html = buildTitleCenteredEmailHtml(floor('Shop Now'))
    expect(html).toContain('>Shop Now</a>')
    expect(html).toContain('href="https://funnyfuzzy.com/collections/beds"')
    expect(html).toContain('font-size:20px')
    expect(html).toContain('font-size:14px')
    expect(html).toContain('width:182px')
    expect(html).toContain('height:34px')
    expect(html).toContain('padding:24px')
    expect(html).toContain('table-layout:fixed')
    expect(html).not.toContain('max-width:750px')
  })

  it('按钮文案为空时不输出按钮，已填写链接也无效', () => {
    const html = buildTitleCenteredEmailHtml(floor(''))
    expect(html).not.toContain('<a ')
    expect(html).not.toContain('https://funnyfuzzy.com/collections/beds')
  })
})
