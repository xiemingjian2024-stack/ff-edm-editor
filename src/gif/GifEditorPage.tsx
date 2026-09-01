import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { GifDraft, GifScene } from './model'
import { applyGifImageBatch, applySplitBannerImages, duplicateGifScene, getSplitBannerImages, getGifCanvasHeight, gifTemplates, normalizeGifDraft, splitBannerFrameImageIndexes } from './model'
import { fileToDataUrl } from '../media/fileDataUrl'
import { GifStage } from './GifStage'
import { MediaControlCard } from '../editor/MediaControlCard'
import { Icon } from '../ui/Icon'
import { ToolButton } from '../ui/ToolButton'
import edmEditorLogo from '../assets/edm-editor-logo.svg'
import { captureFloorPng } from '../export/render'
import { encodeGifFrames, type RgbaFrame } from '../export/gif'

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [rawValue, setRawValue] = useState(value.replace('#', '').toUpperCase())
  useEffect(() => setRawValue(value.replace('#', '').toUpperCase()), [value])
  const commit = (raw: string) => {
    const normalized = raw.replace(/[^0-9a-f]/gi, '').slice(0, 6).toUpperCase()
    setRawValue(normalized)
    if (normalized.length === 6) onChange(`#${normalized}`)
  }
  return <label className="gif-color-field"><span>{label}</span><div><input type="color" value={value} onChange={event => { const next = event.target.value.toUpperCase(); setRawValue(next.replace('#', '')); onChange(next) }}/><input aria-label={`${label}色值`} value={rawValue} onChange={event => commit(event.target.value)} onBlur={() => { if (rawValue.length !== 6) setRawValue(value.replace('#', '').toUpperCase()) }}/></div></label>
}

async function blobToFrame(blob: Blob): Promise<RgbaFrame> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height
  const context = canvas.getContext('2d', { willReadFrequently: true })!; context.drawImage(bitmap, 0, 0)
  return { width: canvas.width, height: canvas.height, data: context.getImageData(0, 0, canvas.width, canvas.height).data }
}

function limitLines(value: string, maximum: number) {
  return value.split('\n').slice(0, maximum).join('\n')
}

export function GifEditorPage({ initialDraft, onSave, onBack }: { initialDraft: GifDraft; onSave: (draft: GifDraft) => void; onBack: () => void }) {
  const gridPositions = ['左上', '右上', '右下', '左下']
  const [draft, setDraft] = useState(() => normalizeGifDraft(initialDraft))
  const draftRef = useRef(draft)
  draftRef.current = draft
  const [selectedSceneId, setSelectedSceneId] = useState(() => normalizeGifDraft(initialDraft).scenes[0]?.id ?? '')
  const [selectedImage, setSelectedImage] = useState(0)
  const [draggedImage, setDraggedImage] = useState<number | null>(null)
  const [previewing, setPreviewing] = useState(true)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [exporting, setExporting] = useState(false)
  const promoDescriptionRef = useRef<HTMLTextAreaElement>(null)
  const template = useMemo(() => gifTemplates.find(item => item.id === draft.templateId)!, [draft.templateId])
  const canvasHeight = getGifCanvasHeight(draft)
  const selectedIndex = Math.max(0, draft.scenes.findIndex(scene => scene.id === selectedSceneId))
  const selectedScene = draft.scenes[selectedIndex]
  const splitImages = useMemo(() => getSplitBannerImages(draft), [draft])
  const selectedMedia = draft.templateId === 'split-banner' ? splitImages[selectedImage] : selectedScene.images[selectedImage]
  const selectedMediaScalePercent = Math.min(100, Math.max(0, ((selectedMedia?.scale ?? 1) * 100 - 100) / 2))
  const shownScene = previewing ? draft.scenes[previewIndex % draft.scenes.length] : selectedScene
  const listedScenes = draft.templateId === 'grid-slideshow' ? draft.scenes.slice(0, 1) : draft.scenes
  const updateDraft = (next: GifDraft) => { const value = { ...normalizeGifDraft(next), updatedAt: new Date().toISOString() }; setDraft(value); onSave(value) }
  const uploadImages = async (files: File[]) => {
    const images = await Promise.all(files.map(fileToDataUrl))
    const next = applyGifImageBatch(draftRef.current, images)
    updateDraft(next)
    setSelectedSceneId(next.scenes[0].id)
    setSelectedImage(0)
    setPreviewIndex(0)
  }
  const updateScene = (next: GifScene) => {
    if (draft.templateId === 'grid-slideshow') {
      updateDraft({ ...draft, scenes: draft.scenes.map(scene => ({ ...scene, images: structuredClone(next.images) })) })
      return
    }
    if (draft.templateId === 'promo-flash') {
      updateDraft({
        ...draft,
        scenes: draft.scenes.map(scene => ({
          ...scene,
          images: structuredClone(next.images),
          eyebrow: next.eyebrow,
          title: next.title,
          description: next.description,
          button: next.button,
        })),
      })
      return
    }
    if (draft.templateId === 'split-banner') {
      const frameIndex = draft.scenes.findIndex(scene => scene.id === next.id)
      if (frameIndex < 0) return
      const images = getSplitBannerImages(draft)
      next.images.forEach((image, imageIndex) => {
        if (image !== draft.scenes[frameIndex].images[imageIndex]) images[splitBannerFrameImageIndexes[frameIndex][imageIndex]] = image
      })
      updateDraft(applySplitBannerImages(draft, images))
      return
    }
    updateDraft({ ...draft, scenes: draft.scenes.map(scene => scene.id === next.id ? next : scene) })
  }

  const emphasizeSelectedDescription = () => {
    const input = promoDescriptionRef.current
    if (!input) return
    const selected = input.value.slice(input.selectionStart, input.selectionEnd).trim()
    if (!selected) return
    updateDraft({ ...draft, common: { ...draft.common, descriptionHighlightText: selected } })
  }
  const reorderGridImages = (from: number, to: number) => {
    if (from === to) return
    const images = [...draft.scenes[0].images]
    const [moved] = images.splice(from, 1); images.splice(to, 0, moved)
    updateDraft({ ...draft, scenes: draft.scenes.map(scene => ({ ...scene, images: structuredClone(images) })) })
    setSelectedImage(to)
  }
  const reorderScenes = (from: number, to: number) => {
    if (from === to) return
    const scenes = [...draft.scenes]; const [moved] = scenes.splice(from, 1); scenes.splice(to, 0, moved)
    updateDraft({ ...draft, scenes }); setSelectedSceneId(moved.id); setSelectedImage(0)
  }
  const reorderSplitImages = (from: number, to: number) => {
    if (from === to) return
    const images = getSplitBannerImages(draft)
    const [moved] = images.splice(from, 1); images.splice(to, 0, moved)
    updateDraft(applySplitBannerImages(draft, images)); setSelectedImage(to)
  }
  const updateSplitImage = (image: typeof selectedMedia) => {
    const images = getSplitBannerImages(draft)
    images[selectedImage] = image
    updateDraft(applySplitBannerImages(draft, images))
  }

  useEffect(() => {
    if (!previewing || draft.scenes.length < 2) return
    const timer = window.setInterval(() => setPreviewIndex(index => (index + 1) % draft.scenes.length), draft.intervalMs)
    return () => window.clearInterval(timer)
  }, [previewing, draft.intervalMs, draft.scenes.length])

  const exportGif = async () => {
    setExporting(true)
    try {
      const nodes = [...document.querySelectorAll<HTMLElement>('.gif-export-scenes [data-gif-scene]')]
      const frames = await Promise.all(nodes.map(async node => blobToFrame(await captureFloorPng(node, { width: template.width, height: canvasHeight }))))
      const bytes = encodeGifFrames(frames, draft.intervalMs)
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'image/gif' }))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${draft.name.replace(/[\\/:*?"<>|]/g, '_')}.gif`; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } finally { setExporting(false) }
  }

  const addScene = () => {
    if (draft.scenes.length >= (draft.templateId === 'image-slideshow' ? 5 : 6)) return
    const next = duplicateGifScene(selectedScene); updateDraft({ ...draft, scenes: [...draft.scenes, next] }); setSelectedSceneId(next.id); setPreviewing(false)
  }
  const removeScene = () => {
    if (draft.scenes.length <= 2) return
    const next = draft.scenes.filter(scene => scene.id !== selectedScene.id); updateDraft({ ...draft, scenes: next }); setSelectedSceneId(next[Math.max(0, selectedIndex - 1)].id)
  }
  const moveScene = (offset: number) => {
    const target = selectedIndex + offset; if (target < 0 || target >= draft.scenes.length) return
    const next = [...draft.scenes]; [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]]; updateDraft({ ...draft, scenes: next })
  }

  return <main className="gif-editor-shell">
    <header className="editor-toolbar gif-editor-header"><div className="toolbar-identity"><ToolButton label="返回作品" icon="back" onClick={onBack}/><img className="project-logo" src={edmEditorLogo} alt="EDM Editor"/></div><div className="toolbar-project"><input aria-label="GIF 名称" value={draft.name} onChange={event => updateDraft({ ...draft, name: event.target.value })}/><small>{template.name} · 自动保存到本机</small></div><div className="toolbar-actions gif-header-actions"><button className="preview-button" onClick={() => setPreviewing(value => !value)}><Icon name="eye"/>{previewing ? '停止预览' : '播放预览'}</button><button className="export-button primary-button" onClick={() => void exportGif()} disabled={exporting}><Icon name="download"/>{exporting ? '生成中…' : '导出 GIF'}</button></div></header>
    <section className="gif-editor-body">
      <aside className="gif-scene-panel"><div className="gif-panel-heading"><div><strong>场景</strong><small>{draft.scenes.length} 帧 · 循环播放</small></div>{draft.templateId === 'grid-slideshow' || draft.templateId === 'promo-flash' || draft.templateId === 'split-banner' ? null : <button onClick={addScene} disabled={draft.scenes.length >= (draft.templateId === 'image-slideshow' ? 5 : 6)} aria-label="添加场景"><Icon name="plus" size={14}/></button>}</div><div className="gif-scene-list">{listedScenes.map((scene, index) => <button key={scene.id} aria-label={draft.templateId === 'grid-slideshow' ? '宫格轮播概览' : `场景 ${index + 1}`} className={scene.id === selectedScene.id ? 'is-active' : ''} onClick={() => { setSelectedSceneId(scene.id); if (draft.templateId === 'grid-slideshow') setPreviewing(true); else { setPreviewing(false); setSelectedImage(draft.templateId === 'split-banner' ? splitBannerFrameImageIndexes[index][0] : 0) } }}><div className="gif-scene-thumb" style={{ '--gif-scene-thumb-height': `${canvasHeight * .46}px` } as CSSProperties}><GifStage draft={draft} scene={scene} exportMode/></div><div className="gif-scene-meta"><strong><span>{draft.templateId === 'grid-slideshow' ? '4' : index + 1}</span>{draft.templateId === 'grid-slideshow' ? '4 帧循环' : `场景 ${index + 1}`}</strong><small>{draft.intervalMs / 1000} 秒/帧</small></div></button>)}</div>{draft.templateId === 'grid-slideshow' || draft.templateId === 'promo-flash' || draft.templateId === 'split-banner' ? null : <div className="gif-scene-actions"><button onClick={() => moveScene(-1)} disabled={selectedIndex === 0} aria-label="上移场景"><Icon name="up" size={14}/></button><button onClick={() => moveScene(1)} disabled={selectedIndex === draft.scenes.length - 1} aria-label="下移场景"><Icon name="down" size={14}/></button><button onClick={removeScene} disabled={draft.scenes.length <= 2} aria-label="删除场景"><Icon name="trash" size={14}/></button></div>}</aside>
      <div className="gif-canvas-area"><div className="gif-canvas-toolbar"><div><strong>画布</strong><span>{template.width * 2} × {canvasHeight * 2}px</span></div><label><span>每帧时长</span><select value={draft.intervalMs} onChange={event => updateDraft({ ...draft, intervalMs: Number(event.target.value) })}><option value="300">0.3 秒</option><option value="500">0.5 秒</option><option value="1000">1 秒</option><option value="1500">1.5 秒</option><option value="2000">2 秒</option></select></label></div><div className={`gif-stage-wrap${previewing ? ' is-previewing' : ''}`} style={{ '--gif-stage-preview-height': `${canvasHeight * 1.16}px` } as CSSProperties}><GifStage draft={draft} scene={shownScene} onSceneChange={draft.templateId === 'grid-slideshow' || draft.templateId === 'image-slideshow' || draft.templateId === 'promo-flash' || draft.templateId === 'split-banner' || !previewing ? updateScene : undefined}/><span className="gif-preview-status">{previewing ? '正在预览' : `编辑场景 ${selectedIndex + 1}`}</span></div><p>{draft.templateId === 'grid-slideshow' ? '直接拖动画布中的图片调整位置，修改会同步到全部 4 帧' : draft.templateId === 'promo-flash' ? '直接拖动画布中的背景图调整位置，两帧会保持完全一致' : draft.templateId === 'split-banner' ? '直接拖动画布中的图片调整位置，同一图片会同步到相关帧' : previewing ? '正在按设置时长循环播放' : '拖动图片可调整位置，右侧可替换内容与样式'}</p></div>
      <aside className="gif-property-panel"><section><h3>图片</h3>{draft.templateId === 'grid-slideshow' ? <><p className="gif-panel-tip">拖拽图片可调整宫格顺序，按左上、右上、右下、左下循环高亮。</p><div className="gif-image-list">{draft.scenes[0].images.map((image, index) => <button type="button" draggable key={index} className={`${selectedImage === index ? 'is-active ' : ''}${draggedImage === index ? 'is-dragging' : ''}`} onClick={() => setSelectedImage(index)} onDragStart={event => { setDraggedImage(index); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)) }} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }} onDrop={event => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(from)) reorderGridImages(from, index); setDraggedImage(null) }} onDragEnd={() => setDraggedImage(null)} aria-label={`选择并拖拽图片 ${index + 1}`}><span className="gif-image-drag"><Icon name="drag" size={15}/></span><span className="gif-image-thumb">{image.image ? <img src={image.image} alt=""/> : <Icon name="image" size={16}/>}</span><strong>图片 {index + 1}</strong><small>{gridPositions[index]} · 第 {index + 1} 帧</small></button>)}</div></> : draft.templateId === 'image-slideshow' ? <><p className="gif-panel-tip">拖拽可调整播放顺序，最多 5 张。</p><div className="gif-image-list">{draft.scenes.map((item, index) => <button type="button" draggable key={item.id} className={`${selectedSceneId === item.id ? 'is-active ' : ''}${draggedImage === index ? 'is-dragging' : ''}`} onClick={() => { setSelectedSceneId(item.id); setSelectedImage(0); setPreviewing(false) }} onDragStart={event => { setDraggedImage(index); event.dataTransfer.setData('text/plain', String(index)) }} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(from)) reorderScenes(from, index); setDraggedImage(null) }} onDragEnd={() => setDraggedImage(null)}><span className="gif-image-drag"><Icon name="drag" size={15}/></span><span className="gif-image-thumb">{item.images[0]?.image ? <img src={item.images[0].image} alt=""/> : <Icon name="image" size={16}/>}</span><strong>图片 {index + 1}</strong><small>第 {index + 1} 帧</small></button>)}</div></> : draft.templateId === 'split-banner' ? <><p className="gif-panel-tip">拖拽可调换四张图片顺序，组合帧会自动更新。</p><div className="gif-image-list">{splitImages.map((image, index) => <button type="button" draggable key={index} className={`${selectedImage === index ? 'is-active ' : ''}${draggedImage === index ? 'is-dragging' : ''}`} onClick={() => setSelectedImage(index)} onDragStart={event => { setDraggedImage(index); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)) }} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }} onDrop={event => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(from)) reorderSplitImages(from, index); setDraggedImage(null) }} onDragEnd={() => setDraggedImage(null)} aria-label={`选择并拖拽图片 ${index + 1}`}><span className="gif-image-drag"><Icon name="drag" size={15}/></span><span className="gif-image-thumb">{image.image ? <img src={image.image} alt=""/> : <Icon name="image" size={16}/>}</span><strong>图片 {index + 1}</strong><small>{index === 0 ? '第 1、4 帧左侧' : index === 1 ? '第 1、2 帧右侧' : index === 2 ? '第 2、3 帧左侧' : '第 3、4 帧右侧'}</small></button>)}</div></> : <div className="gif-image-tabs">{selectedScene.images.map((_, index) => <button key={index} className={selectedImage === index ? 'is-active' : ''} onClick={() => setSelectedImage(index)}>图片 {index + 1}</button>)}</div>}<MediaControlCard onMultipleUpload={draft.templateId === 'promo-flash' ? undefined : uploadImages} maxUploadFiles={draft.templateId === 'image-slideshow' ? 5 : 4} label={draft.templateId === 'grid-slideshow' || draft.templateId === 'split-banner' ? `图片 ${selectedImage + 1}` : `场景 ${selectedIndex + 1} 图片 ${selectedImage + 1}`} value={selectedMedia} onChange={value => draft.templateId === 'split-banner' ? updateSplitImage(value) : updateScene({ ...selectedScene, images: selectedScene.images.map((item, index) => index === selectedImage ? value : item) })}/>{draft.templateId !== 'promo-flash' ? <p className="gif-panel-tip">可一次选择多张图片（最多 {draft.templateId === 'image-slideshow' ? 5 : 4} 张），从图片 1 起依次填入；只选一张则替换当前图片。上传后可拖拽调整顺序。</p> : null}</section>
        {draft.templateId === 'image-slideshow' ? <><section className="gif-canvas-height-section"><h3>画布高度</h3><p className="gif-panel-tip">默认 1:1，可在 300–450px 间调整。</p><div className="range-field gif-height-control"><input aria-label="GIF 画布高度" type="range" min="300" max="450" step="1" value={canvasHeight} style={{ background: `linear-gradient(to right, #111 0%, #111 ${((canvasHeight - 300) / 150) * 100}%, #dedede ${((canvasHeight - 300) / 150) * 100}%, #dedede 100%)` }} onChange={event => updateDraft({ ...draft, canvasHeight: Number(event.target.value) })}/><output>{canvasHeight}px</output></div></section><section><h3>图片大小</h3><p className="gif-panel-tip">调整当前所选图片的缩放比例。</p><div className="range-field gif-height-control"><input aria-label="当前图片大小" type="range" min="100" max="300" step="1" value={Math.round((selectedMedia?.scale ?? 1) * 100)} style={{ background: `linear-gradient(to right, #111 0%, #111 ${selectedMediaScalePercent}%, #dedede ${selectedMediaScalePercent}%, #dedede 100%)` }} onChange={event => updateScene({ ...selectedScene, images: selectedScene.images.map((item, index) => index === selectedImage ? { ...item, scale: Number(event.target.value) / 100 } : item) })}/><output>{Math.round((selectedMedia?.scale ?? 1) * 100)}%</output></div></section></> : null}
        {draft.templateId === 'split-banner' ? <><section className="gif-canvas-height-section"><h3>画布高度</h3><p className="gif-panel-tip">可在 375–750px 间调整，默认 375px。</p><div className="range-field gif-height-control"><input aria-label="GIF 画布高度" type="range" min="375" max="750" step="1" value={canvasHeight * 2} style={{ background: `linear-gradient(to right, #111 0%, #111 ${((canvasHeight * 2 - 375) / 375) * 100}%, #dedede ${((canvasHeight * 2 - 375) / 375) * 100}%, #dedede 100%)` }} onChange={event => updateDraft({ ...draft, canvasHeight: Number(event.target.value) })}/><output>{canvasHeight * 2}px</output></div></section><section><h3>图片大小</h3><p className="gif-panel-tip">调整当前所选图片的缩放比例。</p><div className="range-field gif-height-control"><input aria-label="当前图片大小" type="range" min="100" max="300" step="1" value={Math.round((selectedMedia?.scale ?? 1) * 100)} style={{ background: `linear-gradient(to right, #111 0%, #111 ${selectedMediaScalePercent}%, #dedede ${selectedMediaScalePercent}%, #dedede 100%)` }} onChange={event => updateSplitImage({ ...selectedMedia, scale: Number(event.target.value) / 100 })}/><output>{Math.round((selectedMedia?.scale ?? 1) * 100)}%</output></div></section></> : null}
        {draft.templateId === 'promo-flash' ? <section><h3>公共文案</h3><p className="gif-panel-tip">两帧共享同一套内容，第二帧自动跳动并切换强调色。</p><label>眉题<input value={selectedScene.eyebrow} onChange={event => updateScene({ ...selectedScene, eyebrow: event.target.value })}/></label><label>标题（最多 3 行）<textarea rows={3} value={selectedScene.title} onChange={event => updateScene({ ...selectedScene, title: limitLines(event.target.value, 3) })}/></label><label>描述（最多 2 行）<textarea ref={promoDescriptionRef} rows={2} value={selectedScene.description} onChange={event => updateScene({ ...selectedScene, description: limitLines(event.target.value, 2) })}/></label><div className="gif-promo-highlight"><button type="button" onClick={emphasizeSelectedDescription}>选中并强调</button><input aria-label="描述强调文本" placeholder="先在描述中选中文字" value={draft.common.descriptionHighlightText ?? ''} onChange={event => updateDraft({ ...draft, common: { ...draft.common, descriptionHighlightText: event.target.value } })}/></div><label>按钮（最多 1 行）<input value={selectedScene.button} onChange={event => updateScene({ ...selectedScene, button: event.target.value.replace(/[\r\n]+/g, ' ') })}/></label></section> : null}
        {draft.templateId === 'promo-flash' ? <section><h3>颜色</h3><ColorField label="眉题" value={draft.common.eyebrowColor ?? '#FFAC33'} onChange={value => updateDraft({ ...draft, common: { ...draft.common, eyebrowColor: value } })}/><ColorField label="标题与描述" value={draft.common.textColor || '#FFFFFF'} onChange={value => updateDraft({ ...draft, common: { ...draft.common, textColor: value } })}/><ColorField label="第二帧强调" value={draft.common.highlightColor ?? '#FFAC33'} onChange={value => updateDraft({ ...draft, common: { ...draft.common, highlightColor: value } })}/><ColorField label="按钮" value={draft.common.buttonColor} onChange={value => updateDraft({ ...draft, common: { ...draft.common, buttonColor: value } })}/></section> : null}
      </aside>
    </section>
    <div className="gif-export-scenes" aria-hidden="true">{draft.scenes.map(scene => <GifStage key={scene.id} draft={draft} scene={scene} exportMode/>)}</div>
  </main>
}
