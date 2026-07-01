import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'

export function ToolButton({ label, icon, active, className = '', ...props }: { label: string; icon: IconName; active?: boolean } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>) {
  return <button type="button" className={`tool-button ${active ? 'is-active' : ''} ${className}`} aria-label={label} aria-pressed={active} title={label} {...props}><Icon name={icon} /></button>
}
