export {
  USE_SANITY,
  USE_BLOCK_RESOLVER,
  isSanityEnabled,
  isSanityConfigured,
  SANITY_CONFIG,
} from './config'
export { getHomeContent, getEspecialidades, getLocalHomeContent, getLocalEspecialidades } from './home.adapter'
export {
  getResolvedHomeContent,
  resolveHomeContentFromBlocks,
  legacyFieldsFromBlocks,
} from './homeResolver'
export {
  getServices,
  getHighlights,
  getServiceLinks,
  getMainNavLinks,
  getServicePaths,
  getServiceCtaDefaults,
  getCtaButtonLabels,
  getTalleresMovilesContent,
  getVentanasLunetasContent,
  getEquipamientoEscolarContent,
  getBanquetasContent,
  getButacasContent,
  getAccesoriosContent,
  getVentanasBrands,
  getBanquetasCategories,
  getAccesoriosCategories,
} from './services.adapter'
export { getWorkContent, getTrabajosPreview, getTrabajosPageHero, getWorkPageDisplay } from './work.adapter'
export { getContactContent, getContactPageDisplay, getLocalContactContent } from './contact.adapter'
export { getCompanyInfo, getLocalCompanyInfo } from './company.adapter'
