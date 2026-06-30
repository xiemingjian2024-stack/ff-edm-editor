import express from 'express'
import { readShopifyProduct } from './shopify'

const app = express(); app.use(express.json({ limit: '8kb' }))
app.post('/api/shopify/product', async (request, response) => {
  try { response.json(await readShopifyProduct(String(request.body?.url ?? ''))) }
  catch (error) { response.status(422).json({ code: 'PRODUCT_READ_FAILED', message: error instanceof Error ? error.message : '商品读取失败' }) }
})
app.listen(4174, '127.0.0.1', () => console.log('Shopify reader: http://127.0.0.1:4174'))
