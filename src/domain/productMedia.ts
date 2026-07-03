import type { MediaState, ProductValue } from './edm'

export function getProductMedia(product?: ProductValue): MediaState {
  return {
    image: product?.image ?? '',
    url: '',
    scale: product?.imageScale ?? 1,
    offsetX: product?.imageOffsetX ?? 0,
    offsetY: product?.imageOffsetY ?? 0,
  }
}

export function withProductMedia(product: ProductValue, media: MediaState): ProductValue {
  return {
    ...product,
    image: media.image,
    imageScale: media.scale,
    imageOffsetX: media.offsetX,
    imageOffsetY: media.offsetY,
  }
}
