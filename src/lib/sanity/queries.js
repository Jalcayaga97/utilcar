/**
 * Queries GROQ por página — payload acotado al contrato del frontend.
 * En Studio usar campo `schemaVersion` (sin `_`). GROQ lo expone como _schemaVersion al frontend.
 */
import { SPECIALTIES_CATEGORY_PROJECTION } from './specialtiesProjection.js'
import { WORK_PROJECT_PROJECTION } from './workProjectsProjection.js'

/** Portable Text — richTextBlock.body (Sanity block content). */
export const PORTABLE_TEXT_BODY_PROJECTION = `body[]{
  _type,
  _key,
  style,
  listItem,
  level,
  children[]{
    _type,
    _key,
    text,
    marks
  },
  markDefs[]{
    _type,
    _key,
    href
  }
}`

/** Proyección blocks para Block Resolver (solo cuando VITE_USE_BLOCK_RESOLVER=true). */
export const HOME_BLOCKS_PROJECTION = `blocks[]{
  _type,
  _key,
  enabled,
  order,
  title,
  subtitle,
  description,
  sectionEyebrow,
  sectionTitle,
  sectionDescription,
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
  textLinkLabel,
  textLinkUrl,
  imageAlt,
  eyebrow,
  image{ asset->{ _id, url }, alt },
  primaryImage{ asset->{ _id, url }, alt },
  primaryImageAlt,
  secondaryImage{ asset->{ _id, url }, alt },
  secondaryImageAlt,
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
  images[]{
    _key,
    title,
    caption,
    alt,
    image{ asset->{ _id, url }, alt }
  },
  brands[]{
    _key,
    name,
    website,
    active,
    logo{ asset->{ _id, url, extension, originalFilename }, alt }
  },
  items[]{
    _key,
    _type,
    id,
    title,
    subtitle,
    description,
    client,
    vehicle,
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
  },
  featuredProjects[]{
    projectId,
    project->${WORK_PROJECT_PROJECTION}
  },
  selectedProjects[]->${WORK_PROJECT_PROJECTION},
  ${PORTABLE_TEXT_BODY_PROJECTION}
}`

export const WORK_PROJECTS_QUERY = `*[_type == "workProject" && visible != false] | order(order asc, _createdAt desc) ${WORK_PROJECT_PROJECTION}`

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
    description
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
    description
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

const SERVICES_HUB_FIELDS = `
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
  ctaButtonLabels`

const SERVICE_SUBPAGE_FIELDS = `
  pageKey,
  title,
  tabsSection,
  introExtras,
  tabs[]{
    _key,
    id,
    name,
    description,
    models,
    subtitle,
    intro,
    sections[]{
      title,
      items
    },
    gallery[]{
      image{ asset->{ _id, url }, alt },
      alt,
      caption
    },
    extra
  }`

export const SERVICES_QUERY = `*[_type == "servicesPage"][0]{
  "_schemaVersion": schemaVersion,${SERVICES_HUB_FIELDS}
}`

export const SERVICES_QUERY_WITH_BLOCKS = `*[_type == "servicesPage"][0]{
  "_schemaVersion": schemaVersion,
  ${PAGE_BLOCKS_PROJECTION},${SERVICES_HUB_FIELDS}
}`

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  "_schemaVersion": schemaVersion,
  contactEmail,
  company{
    legalName,
    phone,
    secondaryPhone,
    whatsappNumber,
    primaryEmail,
    secondaryEmail,
    tertiaryEmail,
    addressStreet,
    addressCity,
    openingHours,
    mapsEmbedQuery,
    instagramUrl,
    facebookUrl,
    socialLinks[]{ platform, url }
  },
  serviceCta{
    eyebrow,
    title,
    description,
    primaryButtonLabel,
    primaryButtonUrl,
    secondaryButtonLabel,
    secondaryButtonUrl
  }
}`

export function serviceSubPageQuery(pageKey) {
  return `*[_type == "serviceSubPage" && pageKey == "${pageKey}"][0]{
    "_schemaVersion": schemaVersion,
    ${SERVICE_SUBPAGE_FIELDS},
    ${PAGE_BLOCKS_PROJECTION}
  }`
}

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

const CONTACT_DOCUMENT_FIELDS = `
  form,
  details{
    title,
    description,
    cards{
      phone{ enabled, title },
      email{ enabled, title },
      address{ enabled, title },
      hours{ enabled, title }
    }
  }`

export const CONTACT_QUERY = `*[_type == "contactPage"][0]{
  "_schemaVersion": schemaVersion,${CONTACT_DOCUMENT_FIELDS}
}`

export const CONTACT_QUERY_WITH_BLOCKS = `*[_type == "contactPage"][0]{
  "_schemaVersion": schemaVersion,
  ${PAGE_BLOCKS_PROJECTION},${CONTACT_DOCUMENT_FIELDS}
}`

export const ABOUT_QUERY = `*[_type == "aboutPage"][0]{
  "_schemaVersion": schemaVersion
}`

export const ABOUT_QUERY_WITH_BLOCKS = `*[_type == "aboutPage"][0]{
  "_schemaVersion": schemaVersion,
  ${PAGE_BLOCKS_PROJECTION}
}`
