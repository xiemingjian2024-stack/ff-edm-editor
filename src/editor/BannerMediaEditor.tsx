import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { BannerAnimation, MediaState, NormalizedProduct } from '../domain/edm'
import type { GifDraft } from '../gif/model'
import { getGifCanvasHeight, gifTemplates, normalizeGifDraft } from '../gif/model'
import { GifStage } from '../gif/GifStage'
import { GifPreview } from '../gif/GifPreview'
import { captureFloorPng } from '../export/render'
import { fileToDataUrl } from '../media/fileDataUrl'
import { fetchShopifyProduct } from '../shopify/client'
import { MediaControlCard } from './MediaControlCard'

const emptyMedia = (): MediaState => ({ image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 })

function GifPickerPreview({ draft }: { draft: GifDraft }) {
  return <div className="banner-gif-picker-preview"><GifPreview draft={draft}/></div>
}

async function framesFromDraft(draft: GifDraft): Promise<MediaState[]> {
  if (draft.templateId === 'image-slideshow') return draft.scenes.map(scene => structuredClone(scene.images[0] ?? emptyMedia()))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  const root = [...document.querySelectorAll<HTMLElement>('[data-banner-gif-capture]')].find(node => node.dataset.bannerGifCapture === draft.id)
  if (!root) throw new Error('GIF 预览未准备好，请重新选择作品')
  return Promise.all([...root.querySelectorAll<HTMLElement>('[data-gif-scene]')].map(async node => ({ ...emptyMedia(), image: await fileToDataUrl(await captureFloorPng(node, { width: 375, height: getGifCanvasHeight(draft) })) })))
}

export function BannerMediaEditor({ value, onChange, animation, onAnimationChange = () => {}, gifDrafts = [], reader = fetchShopifyProduct }: { value: MediaState; onChange: (value: MediaState) => void; animation?: BannerAnimation; onAnimationChange?: (value: BannerAnimation) => void; gifDrafts?: GifDraft[]; reader?: (url: string) => Promise<NormalizedProduct> }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [applyingId, setApplyingId] = useState('')
  const [pickerError, setPickerError] = useState('')
  const sources = gifDrafts.map(normalizeGifDraft)
  const source = sources.find(draft => draft.id === animation?.sourceGifDraftId)
  const applySource = async (draft: GifDraft) => {
    setApplyingId(draft.id); setPickerError('')
    try {
      const frames = await framesFromDraft(draft)
      const next: BannerAnimation = { enabled: true, intervalMs: draft.intervalMs, frames, sourceGifDraftId: draft.id, sourceGifDraftName: draft.name }
      onAnimationChange(next)
      if (frames[0]) onChange(structuredClone(frames[0]))
      setPickerOpen(false)
    } catch (error) {
      setPickerError(error instanceof Error ? error.message : 'GIF 作品读取失败')
      setPickerOpen(true)
    } finally { setApplyingId('') }
  }
  const clearSource = () => onAnimationChange({ enabled: false, intervalMs: animation?.intervalMs ?? 1000, frames: [] })
  return <div className="banner-media-editor">
    <MediaControlCard label="Banner 图片" value={value} onChange={next => { if (animation?.enabled) clearSource(); onChange(next) }} reader={reader} showTransformControls={!animation?.enabled} stackLinkActions linkAction={{ label: '引用 GIF 作品', onClick: () => { setPickerError(''); setPickerOpen(true) } }}/>
    {animation?.enabled ? <div className="banner-gif-reference"><div><strong>{animation.sourceGifDraftName ?? '旧版 GIF 动画'}</strong><small>{animation.frames.length} 帧 · {(animation.intervalMs / 1000).toFixed(1).replace('.0', '')} 秒/帧</small></div><span>{source ? <button type="button" onClick={() => void applySource(source)} disabled={applyingId === source.id}>{applyingId === source.id ? '同步中…' : '同步最新'}</button> : null}<button type="button" onClick={clearSource}>取消引用</button></span>{animation.sourceGifDraftId && !source ? <p>来源作品已删除，当前楼层仍保留上次引用的 GIF 快照。</p> : null}</div> : null}
    {pickerOpen ? createPortal(<div className="dialog-backdrop banner-gif-picker-backdrop" role="dialog" aria-modal="true" aria-label="引用 GIF 作品" onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape' && !applyingId) setPickerOpen(false) }}><div className="banner-gif-picker"><header><div><h2>引用 GIF 作品</h2><p>浏览已有 GIF 作品，选择后作为当前 Banner 的动画图片。</p></div><button type="button" autoFocus onClick={() => setPickerOpen(false)} disabled={Boolean(applyingId)}>关闭</button></header>{pickerError ? <p className="banner-gif-picker-error">{pickerError}</p> : null}<div className="banner-gif-picker-grid">{sources.map(draft => <button type="button" key={draft.id} className={animation?.sourceGifDraftId === draft.id ? 'is-selected' : ''} onClick={() => void applySource(draft)} disabled={Boolean(applyingId)}><GifPickerPreview draft={draft}/><span className="banner-gif-picker-meta"><strong>{draft.name}</strong><small>{gifTemplates.find(template => template.id === draft.templateId)?.name} · {draft.scenes.length} 帧</small></span><em>{applyingId === draft.id ? '正在引用…' : animation?.sourceGifDraftId === draft.id ? '已引用' : '选择'}</em></button>)}{!sources.length ? <div className="banner-gif-picker-empty"><strong>还没有 GIF 作品</strong><p>请先回到首页新建并保存 GIF 作品。</p></div> : null}</div></div></div>, document.body) : null}
    {createPortal(<div className="banner-gif-capture-bank" aria-hidden="true">{sources.filter(draft => draft.id === applyingId).map(draft => <div key={draft.id} data-banner-gif-capture={draft.id}>{draft.scenes.map(scene => <GifStage key={scene.id} draft={draft} scene={scene} exportMode/>)}</div>)}</div>, document.body)}
  </div>
}
