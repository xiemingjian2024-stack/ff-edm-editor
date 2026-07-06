import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createShopifyApp } from './server/app'

const shopifyMiddleware = () => {
  const app = createShopifyApp()
  return ((request, response, next) => app(request as never, response as never, next)) as import('vite').Connect.NextHandleFunction
}

export default defineConfig({
  plugins: [react(), {
    name: 'shopify-product-reader',
    configureServer(server) { server.middlewares.use(shopifyMiddleware()) },
    configurePreviewServer(server) { server.middlewares.use(shopifyMiddleware()) },
  }],
})
