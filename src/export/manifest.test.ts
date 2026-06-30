import { makeFileNames, makeManifestCsv } from './manifest'

it('生成稳定文件名和链接清单', () => {
  expect(makeFileNames(3, 'product-card', ['item-1', 'item-2'])).toEqual({ full: '03-product-card-full.jpg', regions: ['03-product-card-item-01.jpg', '03-product-card-item-02.jpg'] })
  expect(makeManifestCsv([{ floorNumber: 3, floorName: '商品卡', fileName: '03.jpg', regionName: '商品 1', width: 375, height: 480, url: 'https://shop/a' }])).toContain('https://shop/a')
})
