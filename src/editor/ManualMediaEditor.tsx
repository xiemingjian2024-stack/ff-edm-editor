import type { MediaState } from '../domain/edm'
import { MediaControlCard } from './MediaControlCard'

export function ManualMediaEditor({ label, value, onChange }: { label: string; value: MediaState; onChange: (value: MediaState) => void }) {
  return <div className="manual-media-editor"><MediaControlCard label={label} value={value} onChange={onChange} /></div>
}
