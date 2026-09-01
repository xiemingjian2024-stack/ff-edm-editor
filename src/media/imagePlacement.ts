import type { MediaState } from '../domain/edm'

/** Shared by the editor and per-frame export. Origin anchoring avoids fractional
 * percentage-centering seams when half-width images are rasterized. */
export function imagePlacement(media: Pick<MediaState, 'scale' | 'offsetX' | 'offsetY'>) {
  return {
    left: '0px',
    top: '0px',
    transform: `translate(${media.offsetX}px, ${media.offsetY}px) scale(${media.scale})`,
  }
}
