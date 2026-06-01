/**
 * Queries GROQ por página — payload acotado al contrato del frontend.
 * En Studio usar campo `schemaVersion` (sin `_`). GROQ lo expone como _schemaVersion al frontend.
 */
import { SPECIALTIES_CATEGORY_PROJECTION } from './specialtiesProjection.js'

/** Proyección blocks para Block Resolver (solo cuando VITE_USE_BLOCK_RESOLVER=true). */
export const HOME_BLOCKS_PROJECTION = `blocks[]{
  _type,
  _key,
  enabled,
  order,
  title,
  subtitle,
  description,
  eyebrow,
  cardLinkLabel,
  ctaLabel,
  ctaTo,
  previewCount,
  buttonLabel,
  buttonLink,
  buttonText,
  primaryLabel,
  primaryTo,
  highlights,
  primaryCta{
    label,
    to,
    ariaLabel
  },
  primaryLink{
    label,
    to,
    ariaLabel
  },
  secondaryLink{
    label,
    to,
    ariaLabel
  },
  imageAlt,
  image{ asset->{ _id, url }, alt },
  mobileImage{ asset->{ _id, url }, alt },
  itemEyebrowPrefix,
  embedQuery,
  iframeTitle,
  keywords,
  canonicalPath,
  noindex,
  ogImage{ asset->{ _id, url }, alt },
  categories[]${SPECIALTIES_CATEGORY_PROJECTION},
  groups[]{
    _key,
    title,
    items[]
  },
  items[]{
    _key,
    _type,
    id,
    title,
    subtitle,
    description,
    question,
    answer,
    features,
    buttonText,
    buttonLink,
    icon,
    link{ label, path },
    image{ asset->{ _id, url }, alt },
    specGroups,
    cta,
    blockMeta
  }
}`

export const HOME_QUERY = `*[_type == "homePage"][0]{
  "_schemaVersion": schemaVersion,
  hero{
    title,
    subtitle,
    highlights,
    secondaryLink,
    imageAlt
  },
  services{
    eyebrow,
    title,
    description,
    cardLinkLabel
  },
  especialidades{
    eyebrow,
    title,
    description,
    itemEyebrowPrefix
  },
  highlights{
    eyebrow,
    title
  },
  portfolioPreview{
    eyebrow,
    title,
    description,
    ctaLabel,
    ctaTo,
    previewCount
  },
  ctaBanner{
    title,
    description,
    primaryLabel,
    primaryTo
  }
}`

export const ESPECIALIDADES_LEGACY_PROJECTION = `{
    id,
    title,
    subtitle,
    intro,
    specGroups,
    cta,
    imageAlt
  }`

export const SPECIALTY_NEW_PROJECTION = `{
    title,
    subtitle,
    description,
    features,
    buttonText,
    buttonLink,
    blockMeta,
    image{
      asset->{ _id, url }
    }
  }`

/** Fetch home con blocks[] — solo para VITE_USE_BLOCK_RESOLVER. */
export const HOME_QUERY_WITH_BLOCKS = `*[_type == "homePage"][0]{
  "_schemaVersion": schemaVersion,
  ${HOME_BLOCKS_PROJECTION},
  hero{
    title,
    subtitle,
    highlights,
    secondaryLink,
    imageAlt
  },
  services{
    eyebrow,
    title,
    description,
    cardLinkLabel
  },
  especialidades{
    eyebrow,
    title,
    description,
    itemEyebrowPrefix
  },
  highlights{
    eyebrow,
    title
  },
  portfolioPreview{
    eyebrow,
    title,
    description,
    ctaLabel,
    ctaTo,
    previewCount
  },
  ctaBanner{
    title,
    description,
    primaryLabel,
    primaryTo
  },
  "specialtiesNew": specialtiesNew[]${SPECIALTY_NEW_PROJECTION}
}`

export const ESPECIALIDADES_QUERY = `*[_type == "homePage"][0]{
  "_schemaVersion": schemaVersion,
  "especialidadesLegacy": coalesce(especialidades.items[], especialidadesList[])${ESPECIALIDADES_LEGACY_PROJECTION},
  "items": coalesce(especialidades.items[], especialidadesList[])${ESPECIALIDADES_LEGACY_PROJECTION},
  "specialtiesNew": specialtiesNew[]${SPECIALTY_NEW_PROJECTION}
}`

/** Proyección blocks para páginas con Page Builder (services, work, contact). */
export const PAGE_BLOCKS_PROJECTION = HOME_BLOCKS_PROJECTION

const SERVICES_FIELDS = `
  serviceLinks[]{ label, path },
  mainNavLinks[]{ label, path },
  services[]{
    id,
    title,
    description,
    path,
    imageAlt
  },
  highlights[]{
    title,
    description
  },
  serviceCtaDefaults,
  ctaButtonLabels,
  talleresMoviles,
  ventanasLunetas,
  equipamientoEscolar,
  banquetas,
  butacas,
  accesorios,
  ventanasBrands,
  banquetasCategories,
  accesoriosCategories`

export const SERVICES_QUERY = `*[_type == "servicesPage"][0]{
  "_schemaVersion": schemaVersion,${SERVICES_FIELDS}
}`

export const SERVICES_QUERY_WITH_BLOCKS = `*[_type == "servicesPage"][0]{
  "_schemaVersion": schemaVersion,
  ${PAGE_BLOCKS_PROJECTION},${SERVICES_FIELDS}
}`

const WORK_FIELDS = `
  page{
    hero,
    intro,
    projects,
    cta
  },
  filters[]{ id, label },
  portfolio[]{
    id,
    title,
    category,
    categoryId,
    description,
    imageAlt
  },
  preview[]{
    id,
    title,
    category,
    description,
    imageAlt,
    imageKey
  },
  ui{
    emptyMessage,
    loadMoreLabel,
    pageSize,
    filterAriaLabel
  }`

export const WORK_QUERY = `*[_type == "workPage"][0]{
  "_schemaVersion": schemaVersion,${WORK_FIELDS}
}`

export const WORK_QUERY_WITH_BLOCKS = `*[_type == "workPage"][0]{
  "_schemaVersion": schemaVersion,
  ${PAGE_BLOCKS_PROJECTION},${WORK_FIELDS}
}`

const CONTACT_FIELDS = `
  hero,
  intro,
  details,
  cta,
  map,
  faq,
  form,
  servicios,
  faqItems`

export const CONTACT_QUERY = `*[_type == "contactPage"][0]{
  "_schemaVersion": schemaVersion,${CONTACT_FIELDS}
}`

export const CONTACT_QUERY_WITH_BLOCKS = `*[_type == "contactPage"][0]{
  "_schemaVersion": schemaVersion,
  ${PAGE_BLOCKS_PROJECTION},${CONTACT_FIELDS}
}`
