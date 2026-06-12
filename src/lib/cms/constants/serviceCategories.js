/** Categorías de proyecto — alineadas con serviceSubPage.pageKey y tabs Trabajos. */
export const SERVICE_CATEGORY_KEYS = [
  'talleres-moviles',
  'ventanas-lunetas',
  'equipamiento-escolar',
  'banquetas',
  'butacas',
  'accesorios',
  'proteccion-cabina',
  'cambio-pisos',
  'reclinaciones',
  'fundas',
  'literas',
  'tapiceria',
]

export const SERVICE_CATEGORY_LABELS = {
  'talleres-moviles': 'Talleres móviles',
  'ventanas-lunetas': 'Ventanas y lunetas',
  'equipamiento-escolar': 'Equipamiento escolar',
  banquetas: 'Banquetas',
  butacas: 'Butacas',
  accesorios: 'Accesorios',
  'proteccion-cabina': 'Protección de cabina',
  'cambio-pisos': 'Cambio de pisos',
  reclinaciones: 'Reclinaciones',
  fundas: 'Fundas',
  literas: 'Literas',
  tapiceria: 'Tapicería',
}

export function isValidServiceCategory(value) {
  return SERVICE_CATEGORY_KEYS.includes(String(value ?? '').trim())
}

export function labelForServiceCategory(categoryId) {
  return SERVICE_CATEGORY_LABELS[categoryId] ?? categoryId
}
