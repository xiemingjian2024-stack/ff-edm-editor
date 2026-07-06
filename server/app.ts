import express from 'express'
import type { NormalizedProduct } from '../src/domain/edm'
import { readShopifyProduct } from './shopify'

type ProductReader = (url: string) => Promise<NormalizedProduct>

export function createShopifyRouter(reader: ProductReader = readShopifyProduct) {
  const router = express.Router()
  router.use(express.json({ limit: '8kb' }))
  router.post('/shopify/product', async (request, response) => {
    try { response.json(await reader(String(request.body?.url ?? ''))) }
    catch (error) { response.status(422).json({ code: 'PRODUCT_READ_FAILED', message: error instanceof Error ? error.message : '商品读取失败' }) }
  })
  return router
}

export function createShopifyApp(reader: ProductReader = readShopifyProduct) {
  const app = express()
  app.use('/api', createShopifyRouter(reader))
  return app
}
