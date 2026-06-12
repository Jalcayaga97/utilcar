/**
 * Manifest alineado con SERVICE_LINKS (content/services.js).
 * Usado por migraciones y auditorías — sin dependencias de React/Lucide.
 */

export const EXPECTED_SERVICE_COUNT = 12

/** Orden alfabético — fuente única para Navbar, Footer y Home. */
export const SERVICE_LINKS_MANIFEST = [
  { label: 'Accesorios', path: '/accesorios' },
  { label: 'Banquetas', path: '/banquetas' },
  { label: 'Butacas', path: '/butacas' },
  { label: 'Cambio de pisos', path: '/cambio-pisos' },
  { label: 'Equipamiento Escolar', path: '/equipamiento-escolar' },
  { label: 'Fundas', path: '/fundas' },
  { label: 'Literas', path: '/literas' },
  { label: 'Protección de cabina', path: '/proteccion-cabina' },
  { label: 'Reclinaciones', path: '/reclinaciones' },
  { label: 'Talleres móviles', path: '/talleres-moviles' },
  { label: 'Tapicería', path: '/tapiceria' },
  { label: 'Ventanas y Lunetas', path: '/ventanas-lunetas' },
]

/** Datos editoriales + assets para servicesBlock.items[] en homePage. */
export const SERVICE_ENTRIES = [
  {
    id: 'accesorios',
    title: 'Accesorios',
    description:
      'Portaequipaje, divisores, pisos, iluminación LED y complementos para conversiones integrales.',
    path: '/accesorios',
    imageAlt: 'Accesorios para conversión vehicular',
    icon: 'truck',
    file: 'src/assets/images/services/accesorios.jpg',
  },
  {
    id: 'banquetas',
    title: 'Banquetas',
    description:
      'Banquetas modulares para vans y minibuses, tapizados técnicos y anclajes reforzados.',
    path: '/banquetas',
    imageAlt: 'Banquetas para minibús',
    icon: 'star',
    file: 'src/assets/images/services/banquetas.jpg',
  },
  {
    id: 'butacas',
    title: 'Butacas',
    description:
      'Butacas ergonómicas para flotas corporativas y turismo, con opciones reclinables y cinturones.',
    path: '/butacas',
    imageAlt: 'Butacas ergonómicas a medida',
    icon: 'users',
    file: 'src/assets/images/services/butacas.jfif',
  },
  {
    id: 'cambio-pisos',
    title: 'Cambio de pisos',
    description:
      'Instalación y renovación de pisos interiores para minibuses, furgones y vehículos especiales.',
    path: '/cambio-pisos',
    imageAlt: 'Cambio de piso técnico en vehículo comercial',
    icon: 'layers',
    file: 'src/assets/images/services/banquetas.jpg',
  },
  {
    id: 'escolar',
    title: 'Equipamiento Escolar',
    description:
      'Conversiones para transporte escolar con normativas de seguridad, asientos y accesorios homologados.',
    path: '/equipamiento-escolar',
    imageAlt: 'Equipamiento escolar en bus',
    icon: 'bus',
    file: 'src/assets/images/services/escolar.jpg',
  },
  {
    id: 'fundas',
    title: 'Fundas',
    description:
      'Fundas personalizadas para protección, uniformidad de flota y fácil mantenimiento.',
    path: '/fundas',
    imageAlt: 'Fundas a medida para asientos de vehículo',
    icon: 'shirt',
    file: 'src/assets/images/services/banquetas.jpg',
  },
  {
    id: 'literas',
    title: 'Literas',
    description:
      'Fabricación e instalación de literas para descanso de tripulación y aplicaciones especiales.',
    path: '/literas',
    imageAlt: 'Literas instaladas en vehículo comercial',
    icon: 'bed-double',
    file: 'src/assets/images/services/banquetas.jpg',
  },
  {
    id: 'proteccion-cabina',
    title: 'Protección de cabina',
    description:
      'Revestimientos y protección de cabina para uso intensivo, con materiales resistentes y terminaciones profesionales.',
    path: '/proteccion-cabina',
    imageAlt: 'Protección interior de cabina en vehículo utilitario',
    icon: 'shield',
    file: 'src/assets/images/services/butacas.jfif',
  },
  {
    id: 'reclinaciones',
    title: 'Reclinaciones',
    description:
      'Mecanismos reclinables para butacas y banquetas en transporte ejecutivo y turismo.',
    path: '/reclinaciones',
    imageAlt: 'Sistema reclinable en butaca de transporte',
    icon: 'rotate-ccw',
    file: 'src/assets/images/services/butacas.jfif',
  },
  {
    id: 'talleres',
    title: 'Talleres móviles',
    description:
      'Unidades equipadas para servicio técnico en ruta, con mobiliario, electricidad y seguridad certificada.',
    path: '/talleres-moviles',
    imageAlt: 'Taller móvil en furgón',
    icon: 'wrench',
    file: 'src/assets/images/services/talleres.jpg',
  },
  {
    id: 'tapiceria',
    title: 'Tapicería',
    description:
      'Cambio de tapiz, reparación y personalización interior para vehículos comerciales.',
    path: '/tapiceria',
    imageAlt: 'Tapicería vehicular — terminaciones Utilcar',
    icon: 'scissors',
    file: 'src/assets/images/services/butacas.jfif',
  },
  {
    id: 'ventanas',
    title: 'Ventanas y Lunetas',
    description:
      'Ventiletes y lunetas a medida por marca y modelo, con terminaciones industriales y sellado profesional.',
    path: '/ventanas-lunetas',
    imageAlt: 'Ventanas laterales corredizas',
    icon: 'settings',
    file: 'src/assets/images/services/ventanas.jpg',
  },
]

export function isAlphabeticalOrder(links = SERVICE_LINKS_MANIFEST) {
  const labels = links.map((link) => link.label)
  const sorted = [...labels].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
  return labels.every((label, index) => label === sorted[index])
}
