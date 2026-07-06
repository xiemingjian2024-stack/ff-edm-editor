import type { BannerAnimation, MediaState, NormalizedProduct } from '../domain/edm'
import { fetchShopifyProduct } from '../shopify/client'
import { MediaControlCard } from './MediaControlCard'

const emptyFrame = (): MediaState => ({ image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 })
export function BannerMediaEditor({ value, onChange, animation, onAnimationChange = () => {}, reader = fetchShopifyProduct }: { value: MediaState; onChange: (value: MediaState) => void; animation?: BannerAnimation; onAnimationChange?: (value: BannerAnimation) => void; reader?: (url: string) => Promise<NormalizedProduct> }) {
  const enabled = animation?.enabled ?? false; const frames = animation?.frames ?? []
  return <div className="banner-media-editor"><div className="animation-mode"><button className={!enabled ? 'is-active' : ''} onClick={() => onAnimationChange({ enabled: false, intervalMs: 1000, frames: [] })}>静态图片</button><button aria-label="GIF 动画" className={enabled ? 'is-active' : ''} onClick={() => onAnimationChange({ enabled: true, intervalMs: 1000, frames: [value, emptyFrame()] })}>GIF 动画</button></div>{enabled ? <div className="animation-frames">{frames.map((frame, index) => <div className="animation-frame" key={index}><strong>帧 {index + 1}</strong><MediaControlCard label={`帧 ${index + 1}`} value={frame} onChange={next => onAnimationChange({ ...animation!, frames: frames.map((item, itemIndex) => itemIndex === index ? next : item) })} reader={reader} /></div>)}<button aria-label="添加帧" disabled={frames.length >= 4} onClick={() => onAnimationChange({ ...animation!, frames: [...frames, emptyFrame()] })}>添加帧</button></div> : <MediaControlCard label="Banner 图片" value={value} onChange={onChange} reader={reader} />}</div>
}
