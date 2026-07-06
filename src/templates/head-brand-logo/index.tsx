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
    version: 1,
    name: '品牌 Logo',
    category: 'head',
    designWidth: 375,
    designHeight: 56,
    fields: [
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
    productSlots: [],
    exportRegions: [{ id: 'full', name: 'HEAD 品牌 Logo', x: 0, y: 0, width: 375, height: 56 }],
  },
  Renderer: HeadBrandLogo,
}
