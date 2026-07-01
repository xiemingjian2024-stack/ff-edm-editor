import { parseTemplate } from './schema'
import { bannerSimple } from './banner-simple'
import { titleCentered } from './title-centered'
import { productGridTwo } from './product-grid-two'
import { headBrandLogo } from './head-brand-logo'
import './templateStyles.css'
import './fonts.css'

export const templateRegistry = [headBrandLogo, bannerSimple, titleCentered, productGridTwo].map(entry => ({ ...entry, definition: parseTemplate(entry.definition) }))
export const getTemplate = (id: string) => templateRegistry.find(item => item.definition.id === id)
