import type { ReactNode } from 'react'
import { Icon } from '../ui/Icon'

export function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="inspector-section"><header><h3>{title}</h3><Icon name="down" size={13}/></header><div className="inspector-section-body">{children}</div></section>
}
