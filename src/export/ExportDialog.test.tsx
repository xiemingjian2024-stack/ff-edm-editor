import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { vi } from 'vitest'
import { ExportDialog } from './ExportDialog'
import { classicPalette } from '../themes/palettes'

afterEach(() => { delete window.edmDesktop })

it('显示导出规格和检查结果', () => {
  render(<ExportDialog draft={{ id: 'a', name: '测试', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '' }} onClose={() => {}} onExport={async () => {}} />)
  expect(screen.getByText('750 PX JPG')).toBeVisible()
  expect(screen.getByRole('heading', { name: '导出检查' })).toBeVisible()
  expect(screen.getByRole('button', { name: '下载 ZIP' })).toHaveClass('primary-button')
})

it('Logo 楼层同时保留切图下载并支持复制 HTML', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<ExportDialog draft={{
    id: 'a', name: 'Logo 输出', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{ id: 'head-1', templateId: 'head-brand-logo', values: { logoHtmlMode: 'pixel', background: '#FFFFFF', logoColor: '#000000', logoLink: 'https://funnyfuzzy.com/pages/about' }, products: {} }],
  }} onClose={() => {}} onExport={async () => {}} />)

  expect(screen.getByRole('button', { name: '下载 ZIP' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '复制 Logo HTML' }))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  const html = writeText.mock.calls[0][0]
  expect(html).toContain('href="https://funnyfuzzy.com/pages/about"')
  expect(html).not.toMatch(/<img\b|<svg\b/i)
  expect(screen.getByRole('button', { name: 'HTML 已复制' })).toBeVisible()
})

it('轻量 Logo 自动同步图片并输出带替代文字的小体积 HTML', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  const onSyncBrandLogo = vi.fn(async () => ({ url: 'https://cdn.example/logo.png', reused: false }))
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  window.edmDesktop = { klaviyo: { status: async () => ({ available: true, connected: true, suffix: 'ABCD' }), connect: async () => ({ available: true, connected: true, suffix: 'ABCD' }), disconnect: async () => ({ available: true, connected: false, suffix: '' }), uploadImage: async () => ({ url: '', reused: false }) } }
  render(<ExportDialog draft={{
    id: 'a', name: '轻量 Logo', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{ id: 'head-light', templateId: 'head-brand-logo', values: { logoHtmlMode: 'lightweight', background: '#FFFFFF', logoColor: '#000000', logoLink: 'https://funnyfuzzy.com/' }, products: {} }],
  }} onClose={() => {}} onExport={async () => {}} onSyncBrandLogo={onSyncBrandLogo} />)
  expect(await screen.findByText('Klaviyo 已连接 ····ABCD')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '复制 Logo HTML' }))
  await waitFor(() => expect(onSyncBrandLogo).toHaveBeenCalledWith('head-light'))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  expect(writeText.mock.calls[0][0]).toContain('src="https://cdn.example/logo.png"')
  expect(writeText.mock.calls[0][0]).toContain('alt="FUNNY FUZZY"')
})

it('分类导航保留切图下载并支持复制带独立链接的 HTML', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<ExportDialog draft={{
    id: 'a', name: '导航输出', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{
      id: 'navigation-1', templateId: 'head-category-navigation',
      values: { navigationCount: '3', background: '#FFFFFF', textColor: '#000000' }, products: {},
      navigationItems: [
        { text: 'Home', url: 'https://funnyfuzzy.com/' },
        { text: 'Carrier & Travel', url: 'https://funnyfuzzy.com/collections/travel-1' },
        { text: 'Couch Covers', url: 'https://funnyfuzzy.com/collections/couch-cover' },
      ],
    }],
  }} onClose={() => {}} onExport={async () => {}} />)

  expect(screen.getByRole('button', { name: '下载 ZIP' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '复制 分类导航 HTML' }))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  const html = writeText.mock.calls[0][0]
  expect(html.match(/<a\b/g)).toHaveLength(3)
  expect(html).toContain('href="https://funnyfuzzy.com/"')
  expect(html).toContain('href="https://funnyfuzzy.com/collections/travel-1"')
  expect(html).toContain('href="https://funnyfuzzy.com/collections/couch-cover"')
})

it('常规标题支持复制 HTML，隐藏按钮时不输出按钮链接', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<ExportDialog draft={{
    id: 'a', name: '标题输出', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{ id: 'title-1', templateId: 'title-centered', products: {}, values: { title: 'A Better Spot', description: 'Comfort', buttonText: '', buttonLink: 'https://funnyfuzzy.com/collections/beds', buttonWidth: 'auto', descriptionSize: 'small', alignment: 'center', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' } }],
  }} onClose={() => {}} onExport={async () => {}} />)

  fireEvent.click(screen.getByRole('button', { name: '复制 常规标题 HTML' }))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  expect(writeText.mock.calls[0][0]).toContain('A Better Spot')
  expect(writeText.mock.calls[0][0]).not.toContain('https://funnyfuzzy.com/collections/beds')
})

it('图文 Banner 复制 HTML 时自动同步图片并保留 ZIP 导出', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  const onSyncBannerImage = vi.fn(async () => ({ url: 'https://cdn.example/klaviyo-banner.jpg', reused: false }))
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  window.edmDesktop = { klaviyo: { status: async () => ({ available: true, connected: true, suffix: 'ABCD' }), connect: async () => ({ available: true, connected: true, suffix: 'ABCD' }), disconnect: async () => ({ available: true, connected: false, suffix: '' }), uploadImage: async () => ({ url: '', reused: false }) } }
  render(<ExportDialog draft={{
    id: 'a', name: '图文输出', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{ id: 'banner-1', templateId: 'banner-image-copy', products: {}, values: { imageHeight: '300', title: 'A Better Spot', description: 'Comfort', buttonText: 'Shop Now', buttonWidth: 'auto', alignment: 'center', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' }, media: { image: 'local.jpg', url: 'https://funnyfuzzy.com/products/bed', scale: 1, offsetX: 0, offsetY: 0 } }],
  }} onClose={() => {}} onExport={async () => {}} onSyncBannerImage={onSyncBannerImage} />)

  expect(screen.getByRole('button', { name: '下载 ZIP' })).toBeVisible()
  expect(await screen.findByText('Klaviyo 已连接 ····ABCD')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '复制 图文 Banner HTML' }))
  await waitFor(() => expect(onSyncBannerImage).toHaveBeenCalledWith('banner-1', expect.objectContaining({ templateId: 'banner-image-copy' })))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  expect(writeText.mock.calls[0][0]).toContain('src="https://cdn.example/klaviyo-banner.jpg"')
  expect(writeText.mock.calls[0][0]).toContain('>A Better Spot</div>')
})

it('N×2 商品卡同步每张商品图并复制 HTML 圆形箭头', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  const onSyncProductGridNBy2Images = vi.fn(async () => ['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg'])
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  window.edmDesktop = { klaviyo: { status: async () => ({ available: true, connected: true, suffix: 'ABCD' }), connect: async () => ({ available: true, connected: true, suffix: 'ABCD' }), disconnect: async () => ({ available: true, connected: false, suffix: '' }), uploadImage: async () => ({ url: '', reused: false }) } }
  render(<ExportDialog draft={{
    id: 'a', name: '商品输出', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{ id: 'products-1', templateId: 'product-grid-n-by-2', values: { title: 'Products', description: '', productCount: '2', pricePrefix: 'From', buttonText: '', background: '#FFFFFF', textColor: '#000000' }, products: {
      'product-1': { image: 'one.jpg', title: 'One', price: '$10', url: 'https://funnyfuzzy.com/products/one' },
      'product-2': { image: 'two.jpg', title: 'Two', price: '$20', url: 'https://funnyfuzzy.com/products/two' },
    } }],
  }} onClose={() => {}} onExport={async () => {}} onSyncProductGridNBy2Images={onSyncProductGridNBy2Images} />)

  expect(await screen.findByText('Klaviyo 已连接 ····ABCD')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '复制 N×2 商品卡 HTML' }))
  await waitFor(() => expect(onSyncProductGridNBy2Images).toHaveBeenCalledWith('products-1'))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  expect(writeText.mock.calls[0][0]).toContain('arcsize="50%"')
})

it('完整预览使用解析后的主题颜色', () => {
  render(<ExportDialog draft={{
    id: 'a', name: '主题预览', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{ id: 'head-1', templateId: 'head-brand-logo', values: { background: '#123456', logoColor: '#000000' }, products: {}, themeColors: { background: { mode: 'theme', slot: 'A' } } }],
  }} previewOnly onClose={() => {}} onExport={async () => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#FFFFFF' })
})

it('完整预览支持自创建的配色套餐', () => {
  const customPalette = { id: 'custom-palette', name: '自定义套餐', slots: { A: '#123456', B: '#ABCDEF', C: '#222222' } }
  render(<ExportDialog draft={{
    id: 'a', name: '自定义预览', themePaletteId: customPalette.id, createdAt: '', updatedAt: '',
    floors: [{ id: 'head-1', templateId: 'head-brand-logo', values: { background: '#FFFFFF', logoColor: '#000000' }, products: {}, themeColors: { background: { mode: 'theme', slot: 'A' } } }],
  }} palettes={[classicPalette, customPalette]} previewOnly onClose={() => {}} onExport={async () => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#123456' })
})

it('弹窗外壳样式不会覆盖模板内部的标题与描述字号', () => {
  const css = readFileSync('src/editor/editor.css', 'utf8')
  expect(css).not.toMatch(/\.export-dialog\s+h2\s*\{/)
  expect(css).not.toMatch(/\.export-dialog\s+header\s+p\s*\{/)
  expect(css).toContain('.export-dialog > header h2')
  expect(css).toContain('.export-dialog > header p')
})

it('下载按钮在非悬停状态也保持黑底白字', () => {
  const css = readFileSync('src/editor/editor.css', 'utf8')
  expect(css).toMatch(/\.export-dialog > footer \.primary-button \{[^}]*background: #111;[^}]*color: #fff;/)
  expect(css).toMatch(/\.export-dialog > footer \.primary-button:disabled \{[^}]*background: #e8e8e8;[^}]*color: #777;/)
})

it('同一楼层存在多个导出问题时不会产生重复列表标识', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const media = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  render(<ExportDialog draft={{ id: 'a', name: '卖点', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '', floors: [{ id: 'points', templateId: 'selling-points-information', values: { itemCount: '4' }, products: {}, mediaSlots: { point1: media, point2: media, point3: media, point4: media } }] }} onClose={() => {}} onExport={async () => {}} />)
  expect(error).not.toHaveBeenCalled()
  error.mockRestore()
})
