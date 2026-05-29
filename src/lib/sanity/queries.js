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
  categories[]${SPECIALTIES_CATEGORY_PROJECTION},
  items[]{
    _key,
    _type,
    title,
    subtitle,
    description,
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

export const SERVICES_QUERY = `*[_type == "servicesPage"][0]{
  "_schemaVersion": schemaVersion,
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
  accesoriosCategories
}`

export const WORK_QUERY = `*[_type == "workPage"][0]{
  "_schemaVersion": schemaVersion,
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
  }
}`

export const CONTACT_QUERY = `*[_type == "contactPage"][0]{
  "_schemaVersion": schemaVersion,
  hero,
  intro,
  details,
  cta,
  map,
  faq,
  form,
  servicios,
  faqItems
}`
