import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'

function ProductGridTwo({ floor }: FloorRenderProps) {
  return <section className="floor-render product-grid-two" style={{ backgroundColor: floor.values.background }}>
    {['product-1', 'product-2'].map((id, index) => { const product = floor.products[id]; return <article className="product-card" key={id}>
      {product?.image ? <img src={product.image} alt={`商品 ${index + 1}`} /> : <div aria-label={`商品 ${index + 1} 图片占位`} style={{ height: 165, background: '#f0eee8', borderRadius: 10 }} />}
      <h3>{product?.title || `商品标题 ${index + 1}`}</h3><p>{product?.price || '¥ --'}</p>
    </article> })}
  </section>
}
export const productGridTwo: RegisteredTemplate = {
  definition: {
    id: 'product-grid-two', version: 1, name: '双列商品卡', category: 'product-card', designWidth: 375, designHeight: 280,
    fields: [{ id: 'background', type: 'color', label: '背景色', defaultValue: '#ffffff' }],
    productSlots: [{ id: 'product-1', label: '商品 1' }, { id: 'product-2', label: '商品 2' }],
    exportRegions: [
      { id: 'item-1', name: '商品 1', x: 0, y: 0, width: 187.5, height: 280, linkSlotId: 'product-1' },
      { id: 'item-2', name: '商品 2', x: 187.5, y: 0, width: 187.5, height: 280, linkSlotId: 'product-2' }
    ]
  }, Renderer: ProductGridTwo
}
