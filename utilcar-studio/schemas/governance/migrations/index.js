export {
  logMigrate,
  logMigrateMerge,
  logMigrateValidate,
  logMigrateWarning,
  printMigrationSummary,
} from './specialtiesMigrationLog.js'
export {
  validateMigratedCategory,
  validateMigratedCategories,
} from './specialtiesMigrationValidators.js'
export {
  mapLegacyItemToCategory,
  buildCategoryGallery,
  buildCategoryFeatures,
  mergeExistingCategories,
  detectMigrationState,
  findMatchingCategory,
  categoryMatchesItem,
  migrateSpecialtiesBlock,
  migrateHomePageBlocks,
  normalizeLegacySpecialtyItem,
  readLegacySpecialtyItemsFromDoc,
  bootstrapHomePageBlocks,
  migrateHomePageDocument,
} from './specialtiesMigration.js'
export {
  loadSeedFile,
  readSeedSpecialtySources,
  seedEntryToCategory,
  mapSeedItemsToCategories,
  importSeedCategoriesIntoBlock,
  importSeedIntoHomePage,
} from './specialtiesSeedImport.js'
export { logImportSpecialties, printImportSummary } from './specialtiesSeedImportLog.js'
