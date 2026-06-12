/**
 * Contenido local — servicios interior / tapicería (fallback CMS).
 * Importado desde services.js
 */
const specSection = (title, items) => ({ title, items })

export const TAPICERIA_CATEGORIES = [
  {
    id: 'cambio-tapiz',
    name: 'Cambio de tapiz',
    intro: [
      'Renovación integral de tapizados en butacas, banquetas y asientos, con selección de materiales técnicos, costuras reforzadas y terminaciones acordes al uso del vehículo.',
    ],
    sections: [
      specSection('Alcance', [
        'Retiro de tapizado existente y preparación de superficies.',
        'Espuma y rellenos según estado y requerimiento del proyecto.',
        'Tapiz en vinil técnico, tela o materiales premium a elección.',
      ]),
      specSection('Terminaciones', [
        'Costuras reforzadas y bordes con terminación profesional.',
        'Combinación de colores y texturas según identidad de flota.',
        'Control de calidad e instalación en taller Utilcar.',
      ]),
    ],
  },
  {
    id: 'reparacion-tapiceria',
    name: 'Reparación de tapicería',
    intro: [
      'Reparación de desgarros, costuras, espuma colapsada y desgaste por uso intensivo, recuperando confort y estética sin reemplazar la estructura del asiento cuando es viable.',
    ],
    sections: [
      specSection('Intervenciones habituales', [
        'Parches y costuras en zonas de alto desgaste.',
        'Reemplazo parcial de espuma en asiento y respaldo.',
        'Refuerzo de costuras y bordes en puntos de fricción.',
      ]),
      specSection('Criterio técnico', [
        'Evaluación previa de estructura y anclajes del asiento.',
        'Materiales compatibles con el tapizado original o equivalente.',
        'Entrega con terminación uniforme y lista para uso.',
      ]),
    ],
  },
  {
    id: 'personalizacion-interior',
    name: 'Personalización interior',
    intro: [
      'Configuraciones de tapicería a medida para proyectos corporativos, turismo y transporte especializado: combinaciones de color, logotipos, detalles de confort y acabados premium.',
    ],
    sections: [
      specSection('Personalización', [
        'Paletas de color y texturas según lineamiento de marca.',
        'Detalles de confort: costuras decorativas, paneles y bordes.',
        'Coordinación con equipamiento interior del proyecto.',
      ]),
      specSection('Proceso', [
        'Relevamiento del vehículo y definición de muestras.',
        'Fabricación y prueba de terminaciones en taller.',
        'Instalación con control de calidad y entrega documentada.',
      ]),
    ],
  },
]

const SPECS_FACTORY = (title, description, sections) => ({
  eyebrow: 'Especificaciones',
  title,
  description,
  sections,
})

export const proteccionCabinaContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Protección de cabina',
    subtitle:
      'Protección interior de cabina para vehículos de trabajo, con materiales resistentes y terminaciones que prolongan la vida útil del habitáculo.',
    imageAlt: 'Protección de cabina en vehículo utilitario — Utilcar Conversiones',
  },
  intro: {
    eyebrow: 'Durabilidad interior',
    title: 'Cabina protegida para uso intensivo',
    paragraphs: [
      'Fabricamos e instalamos soluciones de protección de cabina adaptadas al uso operativo de furgones, camionetas y utilitarios.',
      'Materiales seleccionados para resistir desgaste, humedad y limpieza frecuente, con terminaciones que integran el proyecto de conversión.',
    ],
  },
  specs: SPECS_FACTORY(
    'Alcance del servicio',
    'Protección funcional y estética para cabina de conductor y acompañante.',
    [
      specSection('Aplicación', [
        'Furgones, camionetas y utilitarios de flota.',
        'Zonas de piso, paneles y áreas de contacto frecuente.',
        'Coordinación con equipamiento y accesorios del vehículo.',
      ]),
      specSection('Materiales', [
        'Revestimientos técnicos según uso y exposición.',
        'Terminaciones resistentes a limpieza y desgaste.',
        'Instalación en taller con control de calidad.',
      ]),
    ],
  ),
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description: 'Proyectos de protección de cabina registrados en taller Utilcar.',
  },
  cta: {
    title: 'Cotice protección de cabina para su flota',
    description:
      'Relevamos el vehículo, definimos zonas a proteger y materiales según uso operativo. Fabricación e instalación en taller Utilcar.',
  },
}

export const cambioPisosContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Cambio de pisos',
    subtitle:
      'Renovación e instalación de pisos técnicos para habitáculo de pasajeros y áreas de carga, con terminaciones seguras y fáciles de mantener.',
    imageAlt: 'Cambio de piso interior en vehículo comercial — Utilcar',
  },
  intro: {
    eyebrow: 'Piso técnico',
    title: 'Pisos para uso intensivo',
    paragraphs: [
      'Realizamos cambio e instalación de pisos en minibuses, furgones convertidos y vehículos especiales.',
      'Seleccionamos materiales según normativa, tránsito de pasajeros y resistencia al desgaste, con terminaciones profesionales en taller.',
    ],
  },
  specs: SPECS_FACTORY(
    'Alcance del servicio',
    'Soluciones de piso interior para transporte y conversiones a medida.',
    [
      specSection('Aplicación', [
        'Minibuses, furgones y vehículos de transporte de personal.',
        'Renovación de piso existente o instalación en conversión nueva.',
        'Integración con anclajes, pasillos y equipamiento interior.',
      ]),
      specSection('Características', [
        'Materiales técnicos antideslizantes y de fácil mantenimiento.',
        'Terminaciones en bordes, escalones y zonas de acceso.',
        'Instalación certificada en taller Utilcar.',
      ]),
    ],
  ),
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description: 'Registro visual de cambios de piso en proyectos Utilcar.',
  },
  cta: {
    title: 'Solicite cambio de piso a medida',
    description:
      'Evaluamos el vehículo, definimos material y terminaciones según uso y normativa. Instalación en taller Utilcar.',
  },
}

export const reclinacionesContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Reclinaciones',
    subtitle:
      'Instalación y ajuste de mecanismos reclinables en butacas y banquetas para transporte ejecutivo, turismo y larga distancia.',
    imageAlt: 'Mecanismo reclinable en butaca — Utilcar Conversiones',
  },
  intro: {
    eyebrow: 'Confort en ruta',
    title: 'Reclinación segura y funcional',
    paragraphs: [
      'Integramos sistemas de reclinación en butacas y banquetas según configuración del vehículo y requerimientos de confort.',
      'Trabajamos mecanismos, anclajes y tapicería de forma coordinada para mantener seguridad y ergonomía del asiento.',
    ],
  },
  specs: SPECS_FACTORY(
    'Alcance del servicio',
    'Reclinaciones para butacas, banquetas y asientos a medida.',
    [
      specSection('Aplicación', [
        'Transporte ejecutivo, turismo y servicios de larga distancia.',
        'Integración con estructura existente o butaca nueva.',
        'Coordinación con cinturones y equipamiento del asiento.',
      ]),
      specSection('Instalación', [
        'Mecanismos seleccionados según uso y durabilidad.',
        'Pruebas de funcionamiento y terminación de tapicería.',
        'Control de calidad en taller Utilcar.',
      ]),
    ],
  ),
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description: 'Proyectos con sistemas reclinables instalados por Utilcar.',
  },
  cta: {
    title: 'Consulte reclinaciones para su equipamiento',
    description:
      'Asesoramos en mecanismos y configuración según su vehículo y tipo de servicio. Instalación en taller Utilcar.',
  },
}

export const fundasContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Fundas',
    subtitle:
      'Fundas a medida para asientos y respaldos, protección temporal o permanente con materiales técnicos y costuras reforzadas.',
    imageAlt: 'Fundas para asientos de vehículo — Utilcar Conversiones',
  },
  intro: {
    eyebrow: 'Protección y estética',
    title: 'Fundas según uso operativo',
    paragraphs: [
      'Fabricamos fundas para butacas, banquetas y asientos individuales según medidas y uso del vehículo.',
      'Soluciones para proteger tapizados, uniformar flotas o facilitar limpieza en transporte de pasajeros.',
    ],
  },
  specs: SPECS_FACTORY(
    'Alcance del servicio',
    'Fundas personalizadas para equipamiento de asientos.',
    [
      specSection('Tipos de funda', [
        'Fundas de protección para uso intensivo o traslado temporal.',
        'Fundas decorativas para flotas corporativas.',
        'Materiales lavables y resistentes al desgaste.',
      ]),
      specSection('Fabricación', [
        'Toma de medidas y patronaje según modelo de asiento.',
        'Costuras reforzadas y elásticos en puntos de tensión.',
        'Entrega e instalación asesorada en taller.',
      ]),
    ],
  ),
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description: 'Fundas fabricadas e instaladas en proyectos Utilcar.',
  },
  cta: {
    title: 'Cotice fundas para su flota',
    description:
      'Definimos material, color y tipo de funda según su operación. Fabricación en taller Utilcar.',
  },
}

export const literasContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Literas',
    subtitle:
      'Fabricación e instalación de literas para vehículos de transporte, descanso de tripulación y aplicaciones especiales.',
    imageAlt: 'Literas instaladas en vehículo comercial — Utilcar',
  },
  intro: {
    eyebrow: 'Descanso en ruta',
    title: 'Literas seguras y funcionales',
    paragraphs: [
      'Diseñamos e instalamos literas para furgones, camiones y vehículos especiales según espacio disponible y normativa aplicable.',
      'Estructura reforzada, anclajes seguros y terminaciones que integran el proyecto de conversión interior.',
    ],
  },
  specs: SPECS_FACTORY(
    'Alcance del servicio',
    'Literas a medida para habitáculo y zonas de descanso.',
    [
      specSection('Aplicación', [
        'Vehículos de transporte con zona de descanso para tripulación.',
        'Conversiones especiales según batalla y altura interior.',
        'Coordinación con ventilación, iluminación y accesos.',
      ]),
      specSection('Fabricación', [
        'Estructura metálica con tratamiento anticorrosivo.',
        'Colchonetas y tapiz según requerimiento del proyecto.',
        'Instalación con anclajes y control de calidad en taller.',
      ]),
    ],
  ),
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description: 'Literas fabricadas e instaladas en proyectos Utilcar.',
  },
  cta: {
    title: 'Solicite literas a medida',
    description:
      'Relevamos el vehículo y definimos configuración, materiales y anclajes. Fabricación e instalación en taller Utilcar.',
  },
}

export const tapiceriaContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Tapicería',
    subtitle:
      'Servicios integrales de tapicería para vehículos comerciales: cambio de tapiz, reparación y personalización interior.',
    imageAlt: 'Tapicería vehicular — terminaciones Utilcar Conversiones',
  },
  intro: {
    eyebrow: 'Taller de tapicería',
    title: 'Tapicería vehicular profesional',
    paragraphs: [
      'En Utilcar desarrollamos trabajos de tapicería para butacas, banquetas y equipamiento interior con materiales técnicos y terminaciones de alta calidad.',
      'Cada servicio se adapta al uso del vehículo, normativa aplicable y lineamiento estético de la flota.',
    ],
  },
  categories: {
    eyebrow: 'Líneas de servicio',
    title: 'Servicios de tapicería',
    description:
      'Seleccione una línea para ver alcance, especificaciones y registro visual de trabajos realizados.',
    items: TAPICERIA_CATEGORIES,
  },
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description: 'Registro visual de trabajos de tapicería en proyectos Utilcar.',
  },
  cta: {
    title: 'Consulte tapicería para su proyecto',
    description:
      'Asesoramos en materiales, reparación o renovación integral según su vehículo. Trabajo en taller Utilcar.',
  },
}
