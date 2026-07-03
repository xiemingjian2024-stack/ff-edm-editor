import { parseTemplate } from './schema'
import { bannerSimple } from './banner-simple'
import { titleCentered } from './title-centered'
import { productGridNBy2 } from './product-grid-n-by-2'
import { headBrandLogo } from './head-brand-logo'
import { headCategoryNavigation } from './head-category-navigation'
import { bannerRegular } from './banner-regular'
import { bannerImageCopy } from './banner-image-copy'
import { comparisonInformation } from './comparison-information'
import { singleSellingPointInformation } from './single-selling-point-information'
import { sellingPointsInformation } from './selling-points-information'
import './templateStyles.css'
import './fonts.css'

export const templateRegistry = [headBrandLogo, headCategoryNavigation, bannerRegular, bannerImageCopy, bannerSimple, titleCentered, comparisonInformation, singleSellingPointInformation, sellingPointsInformation, productGridNBy2].map(entry => ({ ...entry, definition: parseTemplate(entry.definition) }))
export const getTemplate = (id: string) => templateRegistry.find(item => item.definition.id === id)
