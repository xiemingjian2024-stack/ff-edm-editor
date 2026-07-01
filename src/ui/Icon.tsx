import type { ReactNode } from 'react'
export type IconName = 'back' | 'layers' | 'drafts' | 'image' | 'search' | 'undo' | 'redo' | 'eye' | 'download' | 'up' | 'down' | 'minus' | 'plus' | 'chevron'

const paths: Record<IconName, ReactNode> = {
  back: <><path d="M15 18l-6-6 6-6"/><path d="M9 12h10"/></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/></>,
  drafts: <><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5"/><path d="M9 13h6M9 17h6"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 20"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  undo: <><path d="M9 7l-5 5 5 5"/><path d="M4 12h9a6 6 0 016 6"/></>,
  redo: <><path d="M15 7l5 5-5 5"/><path d="M20 12h-9a6 6 0 00-6 6"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  up: <path d="M6 15l6-6 6 6"/>, down: <path d="M6 9l6 6 6-6"/>,
  minus: <path d="M5 12h14"/>, plus: <path d="M12 5v14M5 12h14"/>, chevron: <path d="M9 6l6 6-6 6"/>
}

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}
