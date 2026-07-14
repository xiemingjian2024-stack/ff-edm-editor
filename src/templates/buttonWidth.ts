import type { FieldDefinition } from '../domain/edm'

export const buttonWidthField: FieldDefinition = {
  id: 'buttonWidth',
  type: 'choice',
  label: '按钮宽度',
  defaultValue: 'auto',
  options: [
    { label: '适配文案', value: 'auto' },
    { label: '最大宽度', value: 'full' },
  ],
}

export const buttonWidthClass = (value?: string) => value === 'full' ? ' button--full' : ''
export const buttonAlignSelf = (value: string | undefined, alignment = 'center') => {
  if (value === 'full') return 'stretch'
  return alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'
}

