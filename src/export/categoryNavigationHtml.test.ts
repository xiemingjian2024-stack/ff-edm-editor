import { describe, expect, it } from 'vitest'
import { buildCategoryNavigationEmailHtml } from './categoryNavigationHtml'

describe('buildCategoryNavigationEmailHtml', () => {
  it('生成三个带独立链接且不依赖图片的等宽导航项', () => {
    const html = buildCategoryNavigationEmailHtml({
      id: 'navigation', templateId: 'head-category-navigation',
      values: { navigationCount: '3', background: '#FFFFFF', textColor: '#000000' }, products: {},
      navigationItems: [
        { text: 'Home', url: 'https://funnyfuzzy.com/' },
        { text: 'Carrier & Travel', url: 'https://funnyfuzzy.com/collections/travel-1' },
        { text: 'Couch Covers', url: 'https://funnyfuzzy.com/collections/couch-cover' },
      ],
    })

    expect(html).not.toMatch(/<img\b|<svg\b/i)
    expect(html.match(/<a\b/g)).toHaveLength(3)
    expect(html.match(/width="33\.333333333333336%"/g)).toHaveLength(3)
    expect(html).toContain('Carrier &amp; Travel')
    expect(html).toContain('href="https://funnyfuzzy.com/collections/travel-1"')
    expect(html.match(/<table[^>]*width="1" height="10"/g)).toHaveLength(2)
    expect(html.match(/bgcolor="#A6A6A6"/g)).toHaveLength(2)
    expect(html).not.toContain('width="1" height="46"')
  })

  it('旧草稿缺少链接时使用默认地址', () => {
    const html = buildCategoryNavigationEmailHtml({
      id: 'navigation', templateId: 'head-category-navigation',
      values: { navigationCount: '2', background: '#123456', textColor: '#ABCDEF' }, products: {},
      navigationItems: [{ text: 'Home', url: '' }, { text: 'Travel', url: '' }],
    })

    expect(html).toContain('href="https://funnyfuzzy.com/"')
    expect(html).toContain('href="https://funnyfuzzy.com/collections/travel-1"')
    expect(html).toContain('bgcolor="#123456"')
    expect(html).toContain('color:#ABCDEF')
  })
})
