import { applySplitBannerImages, createGifDraft, emptyGifMedia, normalizeGifDraft } from './model'
import type { GifDraft, GifTemplateId } from './model'

// Clockwise: sandstone → sage → mist blue → warm stone.
export const demoImageColors = ['#D8CEBD', '#A7B5AB', '#A2B2BE', '#BDB9B2']

export function createGifTemplateDemo(templateId: GifTemplateId): GifDraft {
  const draft = createGifDraft(templateId)
  // Presentation-only palette: never change the editable template's defaults.
  if (templateId === 'promo-flash') {
    draft.common.buttonColor = demoImageColors[0]
  }
  const images = demoImageColors.map(color => ({
    ...emptyGifMedia(),
    image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="750" height="750"><rect width="750" height="750" fill="${color}"/></svg>`)}`,
  }))
  if (templateId === 'split-banner') return applySplitBannerImages(draft, images)
  draft.scenes = draft.scenes.map((scene, index) => ({
    ...scene,
    images: templateId === 'grid-slideshow' ? structuredClone(images) : [structuredClone(images[templateId === 'promo-flash' ? 3 : index])],
  }))
  return normalizeGifDraft(draft)
}
