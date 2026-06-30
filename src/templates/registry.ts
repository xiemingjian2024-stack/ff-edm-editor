import { parseTemplate } from './schema'
import { bannerSimple } from './banner-simple'
import { titleCentered } from './title-centered'
import { productGridTwo } from './product-grid-two'
import './templateStyles.css'

export const templateRegistry = [bannerSimple, titleCentered, productGridTwo].map(entry => ({ ...entry, definition: parseTemplate(entry.definition) }))
export const getTemplate = (id: string) => templateRegistry.find(item => item.definition.id === id)
