import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'

function HeadBrandLogo({ floor }: FloorRenderProps) {
  const isWhite = floor.values.logoColor === '#FFFFFF'
  return <section
    className="floor-render head-brand-logo"
    data-testid="head-brand-logo"
    style={{ backgroundColor: floor.values.background }}
  >
    <img
      src="/assets/brand-logo.svg"
      alt="FunnyFuzzy"
      style={{ filter: isWhite ? 'invert(1)' : 'none' }}
    />
  </section>
}

export const headBrandLogo: RegisteredTemplate = {
  definition: {
    id: 'head-brand-logo',
    version: 2,
    name: '品牌 Logo',
    category: 'head',
    designWidth: 375,
    designHeight: 56,
    fields: [
      { id: 'logoLink', type: 'text', label: 'Logo 链接', defaultValue: 'https://funnyfuzzy.com/' },
      { id: 'logoHtmlMode', type: 'choice', label: 'HTML 输出方式', defaultValue: 'lightweight', options: [
        { label: '轻量 Logo（推荐）', value: 'lightweight' },
        { label: '无图兼容 Logo', value: 'pixel' },
      ] },
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
      {
        id: 'logoColor',
        type: 'choice',
        label: 'Logo 颜色',
        defaultValue: '#000000',
        options: [
          { label: '黑色', value: '#000000' },
          { label: '白色', value: '#FFFFFF' },
        ],
      },
    ],
    exportFullImage: false,
    productSlots: [],
    exportRegions: [{ id: 'full', name: 'HEAD 品牌 Logo', x: 0, y: 0, width: 375, height: 56 }],
  },
  Renderer: HeadBrandLogo,
}
