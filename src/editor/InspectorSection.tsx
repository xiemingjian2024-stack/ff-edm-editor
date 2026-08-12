import { useState, type ReactNode } from 'react'
import { Icon } from '../ui/Icon'

export function InspectorSection({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return <section className={`inspector-section${open ? ' is-open' : ''}`}><button type="button" className="inspector-section-toggle" aria-expanded={open} onClick={() => setOpen(value => !value)}><h3>{title}</h3><Icon name="down" size={16}/></button>{open ? <div className="inspector-section-body">{children}</div> : null}</section>
}
