import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductSlotEditor } from './ProductSlotEditor'

it('读取商品并允许修改自动填充内容', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  const reader = vi.fn().mockResolvedValue({ title: 'Cloud Bed', image: 'https://cdn/a.jpg', gallery: ['https://cdn/a.jpg'], price: '99.00', url: 'https://shop/products/a' })
  render(<ProductSlotEditor label="商品 1" value={undefined} onChange={onChange} reader={reader} />)
  await user.type(screen.getByLabelText('商品 1 Shopify 链接'), 'https://shop/products/a')
  await user.click(screen.getByRole('button', { name: '自动填充商品 1' }))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cloud Bed', price: '99.00' }))
})
