import { ctaLink } from './content/objects/ctaLink.js'
import { editorialCta } from './content/objects/editorialCta.js'
import { link } from './content/objects/link.js'
import { specialty } from './content/objects/specialty.js'
import {
  specialtyCta,
  specialtyFeature,
  specialtyGalleryItem,
  specialtyLayoutConfig,
  specialtyBrand,
  specialtyCategory,
} from './content/specialties/index.js'
import {
  serviceBlockItem,
  whyUsBlockItem,
  portfolioBlockItem,
  featuredProjectRef,
} from './content/blocks/items/index.js'
import { brand } from './content/brand.js'
import {
  homePage,
  heroBlock,
  specialtiesBlock,
  servicesBlock,
  whyUsBlock,
  whyUtilcarBlock,
  portfolioBlock,
  galleryBlock,
  ctaBlock,
  faqBlock,
  featuresBlock,
  richTextBlock,
  mapBlock,
  seoBlock,
} from './content/homePage.js'
import { pageBlock } from './legacy/objects/pageBlock.js'
import { especialidadItem } from './legacy/objects/especialidadItem.js'
import { servicesPage } from './legacy/pages/servicesPage.js'
import { workPage } from './legacy/pages/workPage.js'
import { contactPage } from './content/contactPage.js'
import { serviceSubPage, serviceTab } from './content/serviceSubPage.js'
import { workProject } from './content/workProject.js'
import { siteSettings, serviceCtaObject, companyObject } from './content/siteSettings.js'

/** Tipos activos en producción + legacy registrados para GROQ/API. */
export const schemaTypes = [
  ctaLink,
  editorialCta,
  link,
  pageBlock,
  specialty,
  specialtyCta,
  specialtyFeature,
  specialtyGalleryItem,
  specialtyLayoutConfig,
  specialtyBrand,
  specialtyCategory,
  serviceBlockItem,
  whyUsBlockItem,
  portfolioBlockItem,
  featuredProjectRef,
  heroBlock,
  specialtiesBlock,
  servicesBlock,
  whyUsBlock,
  whyUtilcarBlock,
  portfolioBlock,
  galleryBlock,
  ctaBlock,
  faqBlock,
  featuresBlock,
  richTextBlock,
  mapBlock,
  seoBlock,
  serviceCtaObject,
  companyObject,
  especialidadItem,
  brand,
  serviceTab,
  serviceSubPage,
  workProject,
  siteSettings,
  homePage,
  servicesPage,
  workPage,
  contactPage,
]
