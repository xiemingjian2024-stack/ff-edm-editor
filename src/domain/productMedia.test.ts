import { describe, expect, it } from 'vitest'
import { getProductMedia, withProductMedia } from './productMedia'

const product = { image: 'image.jpg', title: 'Cloud Bed', price: '$99', url: '/products/cloud' }

describe('商品图片变换', () => {
  it('为旧商品数据补充默认缩放和位置', () => {
    expect(getProductMedia(product)).toEqual({ image: 'image.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 })
  })

  it('将媒体变换写回商品并保留商品内容', () => {
    expect(withProductMedia(product, { image: 'next.jpg', url: '', scale: 1.5, offsetX: 12, offsetY: -8 })).toEqual({
      ...product,
      image: 'next.jpg',
      imageScale: 1.5,
      imageOffsetX: 12,
      imageOffsetY: -8,
    })
  })
})
