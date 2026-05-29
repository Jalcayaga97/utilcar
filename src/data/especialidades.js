import { IMAGES } from '@/assets/images'

/**
 * Contenido técnico original Utilcar — redacción actualizada, sin omitir especificaciones.
 */
export const ESPECIALIDADES = [
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
    image: IMAGES.ventanas.gallery[1].src,
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
    image: IMAGES.services.escolar,
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
    image: IMAGES.services.banquetas,
    imageAlt: 'Banquetas para minibuses fabricadas por Utilcar',
  },
]
