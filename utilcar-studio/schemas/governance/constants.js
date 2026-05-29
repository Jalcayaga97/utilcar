/** Límites editoriales — solo Sanity Studio. */
export const LIMITS = {
  TITLE_MIN: 3,
  DESCRIPTION_SOFT: 300,
  DESCRIPTION_MAX: 500,
  FEATURES_MAX: 6,
  SPECIALTIES_VISIBLE_MAX: 6,
  SPECIALTIES_VISIBLE_SOFT: 6,
  SPECIALTY_CATEGORIES_MAX: 10,
  SPECIALTY_BRANDS_MAX: 12,
  HERO_TITLE_MAX: 80,
  PORTFOLIO_DESCRIPTION_MAX: 220,
}

export const GOVERNANCE_MESSAGES = {
  titleMin: `El título debe tener al menos ${LIMITS.TITLE_MIN} caracteres`,
  titleDuplicate: 'Ya existe una especialidad con este título en la lista',
  descriptionSoft: `Descripción larga — se recomienda ≤${LIMITS.DESCRIPTION_SOFT} caracteres`,
  descriptionMax: `Máximo ${LIMITS.DESCRIPTION_MAX} caracteres`,
  featuresMax: `Máximo ${LIMITS.FEATURES_MAX} características por especialidad`,
  imageRequired: 'Imagen obligatoria — esta especialidad es visible en Home',
  specialtiesOrder: 'El orden de la lista afecta cómo se muestran en la página de inicio (Home)',
  specialtiesTooMany: 'Demasiados ítems en esta sección',
  specialtiesRecommendedMax: `Recomendado máximo ${LIMITS.SPECIALTIES_VISIBLE_MAX} especialidades visibles en Home`,
  canonicalIdDuplicate: 'Dos ítems comparten el mismo identificador canónico (revisar títulos o claves)',
  brandSlugLocked: 'El identificador URL se genera automáticamente y no puede modificarse manualmente',
  specialtyMissingHero: 'Sin imagen principal: el sitio usará placeholder hasta subir heroImage.',
  specialtyInvalidCta: 'CTA incompleto: requiere texto y ruta.',
  specialtyCategoriesTooMany: `Máximo ${LIMITS.SPECIALTY_CATEGORIES_MAX} categorías en Especialidades.`,
  specialtyBrandsTooMany: `Máximo ${LIMITS.SPECIALTY_BRANDS_MAX} marcas por categoría.`,
  brandWithoutGallery: 'Marca sin galería: se recomienda al menos una imagen.',
  emptyFeatures: 'Sin características: agrega al menos un grupo de specs o beneficios.',
  specialtyEmptyGallery: 'Categoría sin galería ni marcas: se recomienda media visual.',
}
