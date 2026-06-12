/**
 * Contenido Home — mock CMS local (preparado para Sanity).
 */
import { IMAGES } from '@/assets/images'

export const homeContent = {
  hero: {
    title: 'Conversiones, modificaciones, tapicería y equipamientos automotrices.',
    subtitle: '',
    highlights: [],
    secondaryLink: {
      label: 'Ver trabajos realizados',
      to: '/trabajos-realizados',
      ariaLabel: 'Ver trabajos realizados por Utilcar',
    },
    imageAlt: 'Logotipo Utilcar Conversiones — conversiones automotrices Santiago',
    primaryImageAlt: 'Logotipo Utilcar Conversiones — conversiones automotrices Santiago',
    secondaryImageAlt: 'Utilcar — años en el mercado',
  },
  services: {
    eyebrow: 'Servicios',
    title: 'Servicios principales',
    description:
      'Áreas de especialización en conversiones y equipamiento vehicular para flotas, empresas e instituciones.',
    cardLinkLabel: 'Ver más',
  },
  especialidades: {
    eyebrow: 'Especialidades',
    title: 'Especialidades Utilcar',
    description:
      'Ingeniería, fabricación e instalación con materiales certificados, procesos controlados y cumplimiento normativo.',
    itemEyebrowPrefix: 'Especialidad',
  },
  highlights: {
    eyebrow: 'Por qué Utilcar',
    title: 'Ingeniería, fabricación e instalación',
  },
  portfolioPreview: {
    eyebrow: 'Portfolio',
    title: 'Trabajos recientes',
    description: 'Proyectos entregados para flotas escolares, corporativas y técnicas.',
    ctaLabel: 'Ver todos',
    ctaTo: '/trabajos-realizados',
    previewCount: 3,
  },
  ctaBanner: {
    title: '¿Listo para convertir su vehículo?',
    description: 'Nuestro equipo técnico le asesora en cada etapa del proyecto.',
    primaryLabel: 'Solicitar cotización',
    primaryTo: '/contacto',
  },
}

const ESPECIALIDADES_RAW = [
  {
    id: 'furgones',
    title: 'Equipamiento para Furgones',
    subtitle: 'Instalación de vidrios laterales',
    intro:
      'Nuestra empresa ofrece instalación de ventanas para todo tipo de furgones, utilizando materiales de alta calidad y terminaciones profesionales.',
    specGroups: [
      {
        title: 'Especificaciones',
        items: [
          '2 ventanas correderas fabricadas en marco de aluminio electropintado.',
          'Sistema con bota aguas y felpa para un deslizamiento suave de los vidrios.',
          'Vidrios templados con seguro perforado para mayor seguridad y resistencia.',
        ],
      },
    ],
    cta: { label: 'Ver ventanas y lunetas', path: '/ventanas-lunetas' },
    image: null /* image resolved in home.js */,
    imageAlt:
      'Ventanas laterales corredizas para furgón — marco de aluminio electropintado y vidrio templado',
  },
  {
    id: 'escolar',
    title: 'Conversión de Buses Escolares',
    subtitle: 'Equipamiento Escolar',
    intro:
      'Nuestros equipamientos escolares cumplen con todas las normas exigidas por el Ministerio de Transporte, utilizando materiales pensados para ofrecer seguridad, resistencia y larga vida útil.',
    specGroups: [
      {
        title: 'Características del equipamiento',
        items: [
          'Asiento de espuma de 6 cm de alta densidad.',
          'Respaldo de espuma de 4 cm de alta densidad.',
          'Cabecera regulable opcional.',
          'Tapiz lateral en vinil liso.',
          'Tapiz de cubiertas en vinil Bronco Benz.',
          'Patas en perfil rectangular 50×30 electropintadas.',
          'Cinturones de seguridad de dos puntas (uso obligatorio).',
          'Letrero de tres caras y sistema de balizas.',
          'Instalación ajustada a los reglamentos del Ministerio de Transporte.',
        ],
      },
    ],
    cta: { label: 'Ver equipamiento escolar', path: '/equipamiento-escolar' },
    image: null,
    imageAlt: 'Equipamiento escolar en bus de transporte de pasajeros',
  },
  {
    id: 'banquetas',
    title: 'Fabricación de Banquetas',
    subtitle: 'Banquetas para Mini Buses',
    intro:
      'Fabricamos banquetas para minibuses utilizando estructuras reforzadas y procesos de fabricación que garantizan resistencia, seguridad y durabilidad.',
    specGroups: [
      {
        title: 'Características de fabricación',
        items: [
          'Estructura de tubo de 1" × 2 mm doblada mediante sistema con sensores electrónicos para mantener uniformidad y resistencia.',
          'Soldadura MIG para mayor firmeza estructural.',
          'Parrilla de suspensión con resortes de acero inoxidable entrelazados para una mejor distribución del peso y mayor durabilidad.',
        ],
      },
      {
        title: 'Opciones de equipamiento',
        items: [
          'Asiento de espuma de 6 cm de alta densidad.',
          'Respaldo de espuma de 4 cm de alta densidad.',
          'Cabecera regulable opcional.',
          'Tapiz a elección del cliente.',
          'Patas en perfil rectangular 50×30 electropintadas.',
          'Cinturones de seguridad de dos puntas.',
        ],
      },
    ],
    cta: { label: 'Ver banquetas', path: '/banquetas' },
    image: null,
    imageAlt: 'Banquetas para minibuses fabricadas por Utilcar',
  },
]


/** Especialidades con referencias de imagen resueltas */
export const ESPECIALIDADES = ESPECIALIDADES_RAW.map((item, index) => ({
  ...item,
  image:
    index === 0
      ? IMAGES.ventanas.gallery[1].src
      : index === 1
        ? IMAGES.services.escolar
        : IMAGES.services.banquetas,
}))
