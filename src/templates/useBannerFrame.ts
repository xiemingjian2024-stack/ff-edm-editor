import { useEffect, useState } from 'react'
import type { BannerAnimation, MediaState } from '../domain/edm'
export function useBannerFrame(animation: BannerAnimation | undefined, fallback: MediaState): MediaState {
  const [index, setIndex] = useState(0); const frames = animation?.enabled && animation.frames.length >= 2 ? animation.frames : [fallback]
  useEffect(() => { setIndex(0); if (frames.length < 2) return; const timer = window.setInterval(() => setIndex(value => (value + 1) % frames.length), animation?.intervalMs || 1000); return () => window.clearInterval(timer) }, [frames.length, animation?.intervalMs])
  return frames[index % frames.length] ?? fallback
}
