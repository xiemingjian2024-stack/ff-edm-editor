import type { CSSProperties } from 'react'
import type { GifDraft, GifScene } from './model'
import { getGifCanvasHeight } from './model'
import { EditableImageFrame } from '../editor/EditableImageFrame'

export function GifStage({ draft, scene, onSceneChange, exportMode = false, schematic = false }: { draft: GifDraft; scene: GifScene; onSceneChange?: (scene: GifScene) => void; exportMode?: boolean; schematic?: boolean }) {
  const updateImage = (index: number, image: GifScene['images'][number]) => onSceneChange?.({ ...scene, images: scene.images.map((item, itemIndex) => itemIndex === index ? image : item) })
  const media = (index: number, className: string) => <div className={className}><EditableImageFrame value={scene.images[index]} onChange={exportMode ? undefined : value => updateImage(index, value)} ariaLabel={`场景图片 ${index + 1}`} /></div>
  const style = {
    '--gif-bg': draft.common.backgroundColor,
    '--gif-text': draft.common.textColor,
    '--gif-accent': draft.common.accentColor,
    '--gif-button': draft.common.buttonColor,
    '--gif-button-text': draft.common.buttonTextColor,
    '--gif-eyebrow': draft.common.eyebrowColor ?? '#FFAC33',
    '--gif-highlight': draft.common.highlightColor ?? draft.common.accentColor ?? '#FFAC33',
  } as CSSProperties

  if (draft.templateId === 'grid-slideshow') return <div className="gif-stage gif-grid-stage" style={style} data-gif-scene={scene.id}>
    {scene.images.map((_, index) => <div className={`gif-grid-cell is-position-${index + 1}${draft.scenes.findIndex(item => item.id === scene.id) === index ? '' : ' is-dimmed'}`} key={index}>{media(index, 'gif-grid-image')}</div>)}
  </div>

  if (draft.templateId === 'image-slideshow') return <div className="gif-stage gif-image-slideshow-stage" style={{ ...style, height: draft.canvasHeight ?? 375 }} data-gif-scene={scene.id}>
    {media(0, 'gif-image-slideshow-media')}
  </div>

  if (draft.templateId === 'promo-flash') {
    const emphasisFrame = draft.scenes.findIndex(item => item.id === scene.id) === 1
    const highlightedText = draft.common.descriptionHighlightText?.trim() ?? ''
    const highlightAt = highlightedText ? scene.description.indexOf(highlightedText) : -1
    const description = highlightAt < 0 ? scene.description : <>{scene.description.slice(0, highlightAt)}<mark>{highlightedText}</mark>{scene.description.slice(highlightAt + highlightedText.length)}</>
    return <div className="gif-stage gif-promo-stage" style={style} data-gif-scene={scene.id}>
    {media(0, 'gif-promo-media')}
    <div className={`gif-promo-overlay${emphasisFrame ? ' is-emphasis-frame' : ''}`}>
      {schematic ? <div className="gif-demo-copy"><div className="gif-demo-eyebrow"/><div className="gif-demo-title"/><div className="gif-demo-title is-short"/><div className="gif-demo-description"><i/><b/></div><div className="gif-demo-description is-short"><i/></div><div className="gif-demo-button"><i/></div></div> : <>
      {scene.eyebrow ? <strong className="gif-eyebrow">{scene.eyebrow}</strong> : null}
      <h2>{scene.title}</h2><p>{description}</p>
      {scene.button ? <span className="gif-scene-button">{scene.button}</span> : null}
      </>}
    </div>
  </div>
  }

  return <div className="gif-stage gif-split-stage" style={{ ...style, height: getGifCanvasHeight(draft) }} data-gif-scene={scene.id}>
    <div className="gif-split-media">{media(0, 'gif-split-cell')}{media(1, 'gif-split-cell')}</div>
  </div>
}
