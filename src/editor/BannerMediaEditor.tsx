import type { MediaState, NormalizedProduct } from '../domain/edm'
import { fetchShopifyProduct } from '../shopify/client'
import { MediaControlCard } from './MediaControlCard'

export function BannerMediaEditor({ value, onChange, reader = fetchShopifyProduct }: { value: MediaState; onChange: (value: MediaState) => void; reader?: (url: string) => Promise<NormalizedProduct> }) {
  return <div className="banner-media-editor"><MediaControlCard label="Banner 图片" value={value} onChange={onChange} reader={reader} /></div>
}
