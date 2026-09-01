import type { MediaState } from '../domain/edm'

export type GifTemplateId = 'grid-slideshow' | 'image-slideshow' | 'promo-flash' | 'split-banner'

export interface GifScene {
  id: string
  images: MediaState[]
  eyebrow: string
  title: string
  description: string
  button: string
}

export interface GifDraft {
  id: string
  name: string
  templateId: GifTemplateId
  intervalMs: number
  canvasHeight?: number
  common: {
    title: string
    description: string
    button: string
    link: string
    backgroundColor: string
    textColor: string
    accentColor: string
    buttonColor: string
    buttonTextColor: string
    eyebrowColor?: string
    highlightColor?: string
    descriptionHighlightText?: string
  }
  scenes: GifScene[]
  createdAt: string
  updatedAt: string
}

export interface GifTemplateDefinition {
  id: GifTemplateId
  name: string
  description: string
  width: 375
  height: number
  imageCount: number
  commonCopy: boolean
}

export const gifTemplates: GifTemplateDefinition[] = [
  { id: 'grid-slideshow', name: '4图·宫格高亮轮播', description: '四张图片按顺时针依次高亮，其余图片叠加 40% 蒙层。', width: 375, height: 375, imageCount: 4, commonCopy: false },
  { id: 'image-slideshow', name: 'N图·切换轮播', description: '2–5 张图片依次循环，适合作为 Banner 动态图片素材。', width: 375, height: 375, imageCount: 1, commonCopy: false },
  { id: 'promo-flash', name: '单图·文字跳动', description: '固定背景与蒙层，标题及选中的描述文字交替变色。', width: 375, height: 346, imageCount: 1, commonCopy: true },
  { id: 'split-banner', name: '4图·左右轮播', description: '四张图片分居左右两侧，按固定的四个组合交替切换。', width: 375, height: 187.5, imageCount: 2, commonCopy: false },
]

/** Rendering uses a 375px design width and exports at 2×. Split height is stored in output pixels. */
export function getGifCanvasHeight(draft: GifDraft): number {
  if (draft.templateId === 'split-banner') return Math.min(750, Math.max(375, Number(draft.canvasHeight) || 375)) / 2
  if (draft.templateId === 'image-slideshow') return draft.canvasHeight ?? 375
  return gifTemplates.find(template => template.id === draft.templateId)!.height
}

export const splitBannerFrameImageIndexes = [[0, 1], [2, 1], [2, 3], [0, 3]] as const

export const emptyGifMedia = (): MediaState => ({ image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 })

function makeScene(template: GifTemplateDefinition): GifScene {
  return {
    id: crypto.randomUUID(),
    images: Array.from({ length: template.imageCount }, emptyGifMedia),
    eyebrow: template.id === 'promo-flash' ? 'PAYDAY' : '',
    title: template.id === 'promo-flash' ? 'FLASH SALE' : '',
    description: template.id === 'promo-flash' ? 'Grab 25% OFF\nBefore It Ends!' : '',
    button: template.id === 'promo-flash' ? 'Save Now' : '',
  }
}

export function createGifDraft(templateId: GifTemplateId): GifDraft {
  const template = gifTemplates.find(item => item.id === templateId) ?? gifTemplates[0]
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: `未命名 GIF - ${template.name}`,
    templateId,
    intervalMs: templateId === 'grid-slideshow' ? 500 : 1000,
    canvasHeight: templateId === 'split-banner' ? 375 : template.height,
    common: {
      title: '',
      description: '',
      button: '',
      link: '', backgroundColor: '#FFAC33', textColor: templateId === 'promo-flash' ? '#FFFFFF' : '#000000', accentColor: '#FFAC33', buttonColor: templateId === 'promo-flash' ? '#FFAC33' : '#000000', buttonTextColor: templateId === 'promo-flash' ? '#000000' : '#FFFFFF',
      eyebrowColor: '#FFAC33', highlightColor: '#FFAC33', descriptionHighlightText: '',
    },
    scenes: Array.from({ length: templateId === 'promo-flash' || templateId === 'image-slideshow' ? 2 : 4 }, () => makeScene(template)),
    createdAt: now, updatedAt: now,
  }
}

export function duplicateGifScene(scene: GifScene): GifScene {
  return { ...structuredClone(scene), id: crypto.randomUUID() }
}

/** Batch uploads replace slots from image 1; untouched slots retain their crop settings. */
export function applyGifImageBatch(source: GifDraft, imageUrls: string[]): GifDraft {
  const limit = source.templateId === 'image-slideshow' ? 5 : source.templateId === 'promo-flash' ? 1 : 4
  if (imageUrls.length > limit) throw new Error(`此模板一次最多上传 ${limit} 张图片`)
  const draft = normalizeGifDraft(source)
  if (!imageUrls.length) return draft
  const images = imageUrls.map(image => ({ ...emptyGifMedia(), image }))
  if (draft.templateId === 'grid-slideshow') {
    const shared = draft.scenes[0].images.map((image, index) => images[index] ?? image)
    return { ...draft, scenes: draft.scenes.map(scene => ({ ...scene, images: structuredClone(shared) })) }
  }
  if (draft.templateId === 'split-banner') {
    return applySplitBannerImages(draft, getSplitBannerImages(draft).map((image, index) => images[index] ?? image))
  }
  if (draft.templateId === 'promo-flash') {
    return { ...draft, scenes: draft.scenes.map(scene => ({ ...scene, images: structuredClone(images) })) }
  }
  const scenes = [...draft.scenes]
  const template = gifTemplates.find(item => item.id === draft.templateId)!
  while (scenes.length < images.length) scenes.push(makeScene(template))
  return { ...draft, scenes: scenes.map((scene, index) => images[index] ? { ...scene, images: [images[index]] } : scene) }
}

export function normalizeGridSlideshowDraft(draft: GifDraft): GifDraft {
  if (draft.templateId !== 'grid-slideshow') return draft
  const template = gifTemplates.find(item => item.id === 'grid-slideshow')!
  const images = Array.from({ length: 4 }, (_, imageIndex) => {
    const available = draft.scenes.map(scene => scene.images[imageIndex]).find(image => image?.image || image?.url)
    return structuredClone(available ?? draft.scenes[0]?.images[imageIndex] ?? emptyGifMedia())
  })
  const scenes = draft.scenes.slice(0, 4)
  while (scenes.length < 4) scenes.push(makeScene(template))
  return { ...draft, scenes: scenes.map(scene => ({ ...scene, images: structuredClone(images) })) }
}

export function getSplitBannerImages(draft: GifDraft): MediaState[] {
  const candidates = [
    draft.scenes[0]?.images[0] ?? draft.scenes[3]?.images[0],
    draft.scenes[0]?.images[1] ?? draft.scenes[1]?.images[1],
    draft.scenes[1]?.images[0] ?? draft.scenes[2]?.images[0],
    draft.scenes[2]?.images[1] ?? draft.scenes[3]?.images[1],
  ]
  return candidates.map(image => structuredClone(image ?? emptyGifMedia()))
}

export function applySplitBannerImages(draft: GifDraft, images: MediaState[]): GifDraft {
  const template = gifTemplates.find(item => item.id === 'split-banner')!
  const sourceImages = Array.from({ length: 4 }, (_, index) => structuredClone(images[index] ?? emptyGifMedia()))
  const scenes = draft.scenes.slice(0, 4)
  while (scenes.length < 4) scenes.push(makeScene(template))
  return {
    ...draft,
    scenes: scenes.map((scene, sceneIndex) => ({
      ...scene,
      images: splitBannerFrameImageIndexes[sceneIndex].map(imageIndex => structuredClone(sourceImages[imageIndex])),
    })),
  }
}

export function normalizeGifDraft(draft: GifDraft): GifDraft {
  if (draft.templateId === 'grid-slideshow') return normalizeGridSlideshowDraft(draft)
  if (draft.templateId === 'split-banner') {
    const height = Number(draft.canvasHeight) || 375
    return applySplitBannerImages({ ...draft, canvasHeight: Math.min(750, Math.max(375, height)) }, getSplitBannerImages(draft))
  }
  if (draft.templateId === 'promo-flash') {
    const template = gifTemplates.find(item => item.id === 'promo-flash')!
    const source = draft.scenes[0] ?? makeScene(template)
    const sharedImage = draft.scenes.map(scene => scene.images[0]).find(image => image?.image || image?.url) ?? source.images[0] ?? emptyGifMedia()
    const scenes = draft.scenes.slice(0, 2)
    while (scenes.length < 2) scenes.push(makeScene(template))
    return {
      ...draft,
      common: {
        ...draft.common,
        textColor: draft.common.textColor || '#FFFFFF',
        eyebrowColor: draft.common.eyebrowColor || '#FFAC33',
        highlightColor: draft.common.highlightColor || draft.common.accentColor || '#FFAC33',
        descriptionHighlightText: draft.common.descriptionHighlightText || '',
        buttonColor: !draft.common.eyebrowColor && draft.common.buttonColor === '#000000' ? '#FFAC33' : draft.common.buttonColor,
        buttonTextColor: !draft.common.eyebrowColor && draft.common.buttonTextColor === '#FFFFFF' ? '#000000' : draft.common.buttonTextColor,
      },
      scenes: scenes.map(scene => ({
        ...scene,
        images: [structuredClone(sharedImage)],
        eyebrow: source.eyebrow,
        title: source.title,
        description: source.description,
        button: source.button,
      })),
    }
  }
  if (draft.templateId !== 'image-slideshow') return draft
  const template = gifTemplates.find(item => item.id === 'image-slideshow')!
  const scenes = draft.scenes.slice(0, 5).map(scene => ({ ...scene, images: [structuredClone(scene.images[0] ?? emptyGifMedia())] }))
  while (scenes.length < 2) scenes.push(makeScene(template))
  const height = Number(draft.canvasHeight) || template.height
  return { ...draft, canvasHeight: Math.min(450, Math.max(300, height)), scenes }
}
