import { useEffect, useMemo, useRef, useState } from 'react'
import { GifStage } from './GifStage'
import { getGifCanvasHeight, normalizeGifDraft } from './model'
import type { GifDraft, GifTemplateId } from './model'
import { createGifTemplateDemo } from './templatePreview'

/** Reuses the export stage so covers preserve crops, text, overlays and frame order. */
export function GifPreview({ draft: source, schematic = false }: { draft: GifDraft; schematic?: boolean }) {
  const draft = useMemo(() => normalizeGifDraft(source), [source])
  const hostRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ width: 180, height: 132 })
  const [frame, setFrame] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const measure = () => { const rect = host.getBoundingClientRect(); if (rect.width && rect.height) setBox({ width: rect.width, height: rect.height }) }
    measure()
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    resize?.observe(host)
    const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    intersection?.observe(host)
    window.addEventListener('resize', measure)
    return () => { resize?.disconnect(); intersection?.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  useEffect(() => {
    if (!visible || draft.scenes.length < 2) return
    const timer = window.setInterval(() => setFrame(index => (index + 1) % draft.scenes.length), draft.intervalMs)
    return () => window.clearInterval(timer)
  }, [visible, draft.id, draft.scenes.length, draft.intervalMs])
  const height = getGifCanvasHeight(draft)
  const scale = Math.min(box.width / 375, box.height / height)
  const index = frame % draft.scenes.length
  return <div className="gif-live-preview" ref={hostRef} data-preview-frame={index} aria-hidden="true">
    <div className="gif-live-preview-size" style={{ width: 375 * scale, height: height * scale }}>
      <div className="gif-live-preview-stage" style={{ transform: `scale(${scale})` }}><GifStage draft={draft} scene={draft.scenes[index]} exportMode schematic={schematic}/></div>
    </div>
  </div>
}

export function GifTemplatePreview({ templateId }: { templateId: GifTemplateId }) {
  const draft = useMemo(() => createGifTemplateDemo(templateId), [templateId])
  return <div className="gif-template-motion"><GifPreview draft={draft} schematic/></div>
}
