import { createShopifyApp } from './app'

createShopifyApp().listen(4174, '127.0.0.1', () => console.log('Shopify reader: http://127.0.0.1:4174'))
