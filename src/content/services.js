/**
 * Contenido Servicios — mock CMS local (preparado para Sanity).
 */
import {
  Bus,
  GraduationCap,
  LayoutGrid,
  Sofa,
  Truck,
  Wrench,
  AppWindow,
} from 'lucide-react'

const SERVICE_LINKS = [
  { label: 'Talleres móviles', path: '/talleres-moviles' },
  { label: 'Ventanas y Lunetas', path: '/ventanas-lunetas' },
  { label: 'Equipamiento Escolar', path: '/equipamiento-escolar' },
  { label: 'Banquetas', path: '/banquetas' },
  { label: 'Butacas', path: '/butacas' },
  { label: 'Accesorios', path: '/accesorios' },
]

/** Navegación principal (sin servicios — van en dropdown) */
const MAIN_NAV_LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Trabajos', path: '/trabajos-realizados' },
  { label: 'Contacto', path: '/contacto' },
]

const SERVICES_LIST = [
  {
    id: 'talleres',
    title: 'Talleres móviles',
    imageAlt:
      'Taller móvil en furgón — mobiliario técnico y conversión para trabajo en terreno, Santiago',
    description:
      'Unidades equipadas para servicio técnico en ruta, con mobiliario, electricidad y seguridad certificada.',
    path: '/talleres-moviles',
    icon: Wrench,
  },
  {
    id: 'ventanas',
    title: 'Ventanas y Lunetas',
    imageAlt:
      'Ventanas laterales corredizas instaladas en furgón — lunetas y ventiletes Utilcar',
    description:
      'Ventiletes y lunetas a medida por marca y modelo, con terminaciones industriales y sellado profesional.',
    path: '/ventanas-lunetas',
    icon: AppWindow,
  },
  {
    id: 'escolar',
    title: 'Equipamiento Escolar',
    imageAlt:
      'Equipamiento escolar en bus — butacas homologadas y conversión para transporte de pasajeros',
    description:
      'Conversiones para transporte escolar con normativas de seguridad, asientos y accesorios homologados.',
    path: '/equipamiento-escolar',
    icon: GraduationCap,
  },
  {
    id: 'banquetas',
    title: 'Banquetas',
    imageAlt:
      'Banquetas para minibús instaladas en vehículo de transporte de pasajeros',
    description:
      'Banquetas modulares para vans y minibuses, tapizados técnicos y anclajes reforzados.',
    path: '/banquetas',
    icon: Sofa,
  },
  {
    id: 'butacas',
    title: 'Butacas',
    imageAlt: 'Butacas ergonómicas a medida para flota corporativa y transporte especializado',
    description:
      'Butacas ergonómicas para flotas corporativas y turismo, con opciones reclinables y cinturones.',
    path: '/butacas',
    icon: LayoutGrid,
  },
  {
    id: 'accesorios',
    title: 'Accesorios',
    imageAlt:
      'Accesorios para conversión vehicular — cabeceras, señalización y complementos de seguridad',
    description:
      'Portaequipaje, divisores, pisos, iluminación LED y complementos para conversiones integrales.',
    path: '/accesorios',
    icon: Truck,
  },
]

const HIGHLIGHTS_LIST = [
  {
    title: 'Ingeniería propia',
    description: 'Diseño y fabricación con control de calidad en cada etapa del proceso.',
    icon: Bus,
  },
  {
    title: 'A medida por vehículo',
    description: 'Soluciones adaptadas a marca, modelo y uso operativo de su flota.',
    icon: Truck,
  },
  {
    title: 'Instalación certificada',
    description: 'Taller especializado con protocolos de montaje y terminación premium.',
    icon: Wrench,
  },
]


const SERVICE_ICONS = {
  talleres: Wrench,
  ventanas: AppWindow,
  escolar: GraduationCap,
  banquetas: Sofa,
  butacas: LayoutGrid,
  accesorios: Truck,
}

const HIGHLIGHT_ICONS = [Bus, Truck, Wrench]

export const SERVICES = SERVICES_LIST.map((service) => ({
  ...service,
  icon: SERVICE_ICONS[service.id],
}))

export const HIGHLIGHTS = HIGHLIGHTS_LIST.map((item, index) => ({
  ...item,
  icon: HIGHLIGHT_ICONS[index],
}))

export const SERVICE_PATHS = SERVICE_LINKS.map((link) => link.path)

export const serviceCtaDefaults = {
  title: 'Solicite una solución personalizada para su operación',
  description:
    'Nuestro equipo técnico releva su vehículo, define el layout interior y propone materiales y terminaciones según su uso en terreno.',
  primaryLabel: 'Solicitar cotización',
  primaryTo: '/contacto',
}

export const ctaButtonLabels = {
  primaryLabel: 'Solicitar cotización',
  primaryTo: '/contacto',
  whatsAppLabel: 'Contactar por WhatsApp',
}

const specSection = (title, items) => ({ title, items })

const TALLERES_INTRO = [
  'Nuestra especialidad es modificar vehículos para trabajar en terreno: talleres móviles, bibliotecas móviles y oficinas móviles.',
  'Realizamos revestimientos interiores en zonas de carga en madera o en el material que el cliente defina, según el uso operativo de cada unidad.',
]

const TALLERES_SOLUCIONES = [
  'Talleres móviles',
  'Bibliotecas móviles',
  'Oficinas móviles',
  'Vehículos de apoyo técnico',
]

const TALLERES_CARACTERISTICAS = [
  'Diseño personalizado',
  'Optimización de espacios',
  'Compartimientos interiores',
  'Revestimientos resistentes',
  'Terminaciones profesionales',
  'Adaptación según operación del cliente',
]


export const talleresMovilesContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Talleres Móviles',
    subtitle: 'Soluciones móviles para trabajo en terreno',
    imageAlt: 'Taller móvil equipado por Utilcar para trabajo en terreno',
  },
  intro: {
    eyebrow: 'Especialidad',
    title: 'Vehículos adaptados para operación en terreno',
    paragraphs: TALLERES_INTRO,
  },
  scope: {
    eyebrow: 'Alcance',
    title: 'Soluciones y características',
    description:
      'Diseño y fabricación de unidades móviles con foco en funcionalidad, resistencia y terminaciones profesionales.',
    lists: {
      soluciones: { title: 'Tipos de solución', items: TALLERES_SOLUCIONES },
      caracteristicas: { title: 'Características', items: TALLERES_CARACTERISTICAS },
    },
  },
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description: 'Conversiones reales de vehículos para talleres móviles y uso técnico en terreno.',
  },
}


const VENTANAS_INTRO = {
  title: 'Características técnicas de ventanas',
  paragraphs: [
    'Fabricación en aluminio sometido a proceso de fosfatizado y posterior electropintado en color negro, con botaguas y felpa importada para el deslizamiento del vidrio. Cristales templados en todas las aplicaciones.',
  ],
  procesoTemplado: {
    title: 'Proceso de templado del vidrio',
    text: 'Cristal sometido a tratamiento térmico de templado horizontal que incrementa su resistencia a esfuerzos de origen mecánico y térmico. Tras el tratamiento se denomina cristal de seguridad: en caso de rotura se fracciona en pequeños trozos no cortantes, eliminando el riesgo de accidentes por astillas.',
  },
  especificaciones: [
    'Aluminio fosfatizado y electropintado color negro',
    'Botaguas y felpa importada para deslizamiento del vidrio',
    'Vidrios templados de seguridad',
    'Resistencia mecánica y térmica incrementada',
    'Fractura en trozos no cortantes (cristal de seguridad)',
    'Instalación en taller especializado Utilcar',
  ],
}



/** Equipamiento por marca — categorías: Ventanas, Asientos, Seguridad, Interior, Opcionales */
const VENTANAS_BRANDS = [
  {
    id: 'toyota',
    name: 'Toyota',
    models: ['Hiace', 'Hilux', 'Proace / Proace City'],
    sections: [
      specSection('Ventanas', [
        'Ventanas corredizas laterales en marco de aluminio electropintado.',
        'Luneta trasera y ventiletes según versión de carrocería.',
        'Vidrios templados con seguro perforado.',
        'Kits para Hiace de transporte escolar y uso mixto.',
      ]),
      specSection('Asientos', [
        'Butacas y banquetas para Hiace y Proace.',
        'Distribuciones 2+1, 3+0 y personalizadas.',
        'Espuma de alta densidad en asiento y respaldo.',
      ]),
      specSection('Seguridad', [
        'Cinturones de seguridad de dos puntas.',
        'Balizas y señalética según normativa de transporte.',
        'Anclajes al piso certificados.',
      ]),
      specSection('Interior', [
        'Revestimiento interior en madera o material a elección.',
        'Piso antideslizante en zona de carga.',
        'Iluminación LED perimetral opcional.',
      ]),
      specSection('Opcionales', [
        'Cabeceras regulables.',
        'Portaequipaje interior.',
        'Malla de seguridad en ventanas.',
        'Climatización según proyecto.',
      ]),
    ],
  },
  {
    id: 'peugeot',
    name: 'Peugeot',
    models: ['Boxer', 'Partner', 'Expert / Traveller'],
    sections: [
      specSection('Ventanas', [
        'Ventiletes y lunetas para Boxer y Expert (chasis K0).',
        'Ventanas corredizas de 2.ª y 3.ª fila según batalla (L2 / L3).',
        'Sustitución o apertura de huecos a medida en carrocería.',
        'Vidrio templado tintado según aplicación.',
      ]),
      specSection('Asientos', [
        'Banquetas modulares para Boxer escolar y turismo.',
        'Butacas individuales para Traveller ejecutivo.',
        'Tapizados en vinil técnico Bronco Benz u opción a elección.',
      ]),
      specSection('Seguridad', [
        'Cinturones en todas las plazas homologadas.',
        'Letrero reglamentario de tres caras.',
        'Sistema de balizas para transporte escolar.',
      ]),
      specSection('Interior', [
        'Forrado de interiores y terminaciones en zona habitáculo.',
        'Pasillos y accesos según reglamento.',
        'Revestimientos sanitizables.',
      ]),
      specSection('Opcionales', [
        'Ventanas fijas en puertas traseras dobles.',
        'Divisores de carga.',
        'Portavasos y mesas abatibles.',
      ]),
    ],
  },
  {
    id: 'renault',
    name: 'Renault',
    models: ['Master', 'Kangoo', 'Trafic'],
    sections: [
      specSection('Ventanas', [
        'Kit de ventanas laterales para Master.',
        'Ventilete corredizo y luneta trasera.',
        'Ventanas para Kangoo de reparto y escolar.',
        'Sellado profesional con burletes técnicos.',
      ]),
      specSection('Asientos', [
        'Equipamiento escolar en Master con butacas homologadas.',
        'Banquetas para traslado de personal en Trafic.',
        'Patas en perfil 50×30 electropintado.',
      ]),
      specSection('Seguridad', [
        'Instalación según reglamentos del Ministerio de Transporte.',
        'Salidas de emergencia señalizadas.',
        'Cinturones de dos puntas en todas las plazas.',
      ]),
      specSection('Interior', [
        'Revestimiento de piso y laterales.',
        'Compartimientos para herramientas en versiones técnicas.',
        'Aislación y terminación perimetral.',
      ]),
      specSection('Opcionales', [
        'Ventanas con apertura parcial.',
        'Estanterías modulares.',
        'Iluminación de lectura.',
      ]),
    ],
  },
  {
    id: 'suzuki',
    name: 'Suzuki',
    models: ['Super Carry', 'Every', 'APV'],
    sections: [
      specSection('Ventanas', [
        'Ventanas laterales para utilitarios compactos.',
        'Luneta trasera a medida.',
        'Marco de aluminio electropintado con felpa.',
        'Vidrios templados de seguridad.',
      ]),
      specSection('Asientos', [
        'Banquetas para transporte urbano y escolar.',
        'Redistribución de plazas según habilitación.',
        'Tapiz en vinil liso de alta resistencia.',
      ]),
      specSection('Seguridad', [
        'Cinturones según normativa vigente.',
        'Cartelería de identificación escolar.',
        'Fijaciones reforzadas al chasis del vehículo.',
      ]),
      specSection('Interior', [
        'Revestimiento básico o premium según uso.',
        'Piso en material antideslizante.',
        'Protección de paneles interiores.',
      ]),
      specSection('Opcionales', [
        'Portaequipaje en techo.',
        'Red de carga.',
        'Ventilación adicional.',
      ]),
    ],
  },
  {
    id: 'fiat',
    name: 'Fiat',
    models: ['Ducato', 'Fiorino', 'Scudo'],
    sections: [
      specSection('Ventanas', [
        'Ventanas corredizas y fijas para Ducato (chasis X250 / X290).',
        'Lunetas de doble puerta trasera.',
        'Ventiletes para Fiorino y Scudo.',
        'Compatibilidad con batallas L1, L2, L3 y L4.',
      ]),
      specSection('Asientos', [
        'Butacas y banquetas para Ducato escolar y corporativo.',
        'Configuración de pasillo central homologado.',
        'Espuma 6 cm asiento / 4 cm respaldo.',
      ]),
      specSection('Seguridad', [
        'Homologación para transporte de pasajeros.',
        'Balizas y letreros reglamentarios.',
        'Anclajes testeados en piso.',
      ]),
      specSection('Interior', [
        'Forrado completo de habitáculo.',
        'Revestimiento en zona de carga.',
        'Terminaciones en cantos y uniones.',
      ]),
      specSection('Opcionales', [
        'Ventanas 180° en puertas traseras (según bisagra).',
        'Aislantes térmicos.',
        'Módulos de almacenaje.',
      ]),
    ],
  },
  {
    id: 'citroen',
    name: 'Citroën',
    models: ['Jumper', 'Berlingo', 'Spacetourer'],
    sections: [
      specSection('Ventanas', [
        'Ventanas corredizas para Jumper (equivalente Boxer / Ducato).',
        'Luneta y ventiletes para Berlingo.',
        'Kits para Spacetourer de pasajeros.',
        'Cristales templados con tratamiento de seguridad.',
      ]),
      specSection('Asientos', [
        'Equipamiento de butacas para transporte escolar.',
        'Banquetas en configuraciones múltiples.',
        'Cabecera regulable opcional.',
      ]),
      specSection('Seguridad', [
        'Cumplimiento normativa Ministerio de Transporte.',
        'Cinturones de dos puntas obligatorios.',
        'Señalética y balizas homologadas.',
      ]),
      specSection('Interior', [
        'Tapicería y revestimientos interiores.',
        'Pisos técnicos para alto tránsito.',
        'Paneles laterales forrados.',
      ]),
      specSection('Opcionales', [
        'Ventanas fijas traseras.',
        'Climatización posterior.',
        'Portaobjetos y divisiones modulares.',
      ]),
    ],
  },
  {
    id: 'chevrolet',
    name: 'Chevrolet',
    subtitle: 'Opciones de equipamiento',
    sections: [
      specSection('Ventanas', [
        '2 ventanas de corredera en marco de aluminio electropintado, con botaguas y felpa importada para el deslizamiento de vidrios.',
        'Vidrios templados con seguro perforado.',
      ]),
      specSection('Asientos', [
        'Asiento adulto tipo banqueta abatible, fabricado en tubo de 2 mm.',
        'Disponible en dos modelos de sujeción: por seguro o por correas.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados para mayor resistencia y funcionamiento uniforme.',
        'Espuma de poliuretano de alta densidad.',
        'Tapiz combinado en vinil con tela a elección.',
      ]),
      specSection('Seguridad', [
        '3 cinturones de seguridad de 2 puntas.',
      ]),
      specSection('Interior', [
        '2 asientos laterales abatibles traseros.',
        'Forrado de costados.',
        'Forrado de cielo interior.',
      ]),
      specSection('Opcionales', [
        'Hasta 3 cabeceras regulables en la banqueta principal.',
      ]),
    ],
  },
]


export const ventanasLunetasContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Ventanas y Lunetas',
    subtitle:
      'Instalación y fabricación de ventanas para vehículos utilitarios, minibuses y transporte especializado.',
    imageAlt: 'Ventanas y lunetas instaladas en vehículo utilitario por Utilcar',
  },
  intro: { eyebrow: 'Especificaciones', ...VENTANAS_INTRO },
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos de ventanas y lunetas',
    description:
      'Instalaciones realizadas con marco de aluminio electropintado, vidrios templados y terminación profesional.',
  },
  brands: {
    eyebrow: 'Por marca',
    title: 'Equipamiento por marca',
    description:
      'Soluciones de ventanas, asientos, seguridad, interior y opcionales organizadas según cada fabricante.',
  },
  cta: {
    title: 'Solicite una solución personalizada para su operación',
    description:
      'Relevamos su vehículo, definimos el kit de ventanas o equipamiento y fabricamos con materiales certificados e instalación en taller Utilcar.',
  },
}




const ESCOLAR_INTRO = {
  title: 'Transformación de vehículos escolares',
  paragraphs: [
    'Contamos con experiencia en la transformación de vehículos y equipamiento para transporte escolar. Marcas reconocidas del mercado confían en nuestro taller para el equipamiento de sus unidades.',
    'Desarrollamos cada proyecto con foco en seguridad operativa, cumplimiento normativo, durabilidad de materiales, funcionalidad del habitáculo y terminaciones profesionales — desde la distribución interior hasta la señalética reglamentaria.',
  ],
}

const ESCOLAR_SECTIONS = [
  specSection('Equipamiento escolar', [
    'Butacas y banquetas para transporte de pasajeros escolares.',
    'Espuma de poliuretano de alta densidad: 6 cm en asiento y 4 cm en respaldo.',
    'Cabecera regulable opcional según configuración.',
    'Tapiz lateral en vinil liso y cubiertas en vinil técnico Bronco Benz.',
    'Patas en perfil rectangular 50×30 electropintado.',
    'Instalación profesional en taller especializado Utilcar.',
  ]),
  specSection('Seguridad', [
    'Cinturones de seguridad de dos puntas en todas las plazas homologadas.',
    'Letrero reglamentario de tres caras.',
    'Sistema de balizas para transporte escolar.',
    'Salidas de emergencia señalizadas.',
    'Cumplimiento de reglamentos del Ministerio de Transporte.',
  ]),
  specSection('Interior y terminaciones', [
    'Revestimientos interiores resistentes y de fácil sanitización.',
    'Forrado de costados y cielo según proyecto.',
    'Pisos técnicos antideslizantes en zona de tránsito.',
    'Iluminación interior LED perimetral opcional.',
    'Terminaciones en cantos y uniones.',
  ]),
  specSection('Configuración del vehículo', [
    'Distribución interior con pasillo central homologado.',
    'Layouts 2+1, 3+0 y personalizados según batalla y modelo.',
    'Integración de ventanas y lunetas al equipamiento.',
    'Optimización de capacidad sin comprometer accesos.',
    'Materiales seleccionados para alto tránsito y larga vida útil.',
  ]),
  specSection('Opcionales', [
    'Malla de seguridad en ventanas.',
    'Portavasos y mesas abatibles.',
    'Climatización posterior.',
    'Documentación de apoyo para habilitación del vehículo.',
    'Señalética y accesorios de identificación escolar adicionales.',
  ]),
]


export const equipamientoEscolarContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Equipamiento Escolar',
    subtitle:
      'Transformación y equipamiento de vehículos escolares según normativas y requerimientos de transporte.',
    imageAlt:
      'Equipamiento escolar instalado en vehículo de transporte de pasajeros por Utilcar',
  },
  intro: { eyebrow: 'Especialidad', ...ESCOLAR_INTRO },
  specs: {
    eyebrow: 'Especificaciones',
    title: 'Alcance del equipamiento',
    description:
      'Soluciones integrales para transporte escolar: seguridad, interior, configuración y opcionales según normativa vigente.',
    sections: ESCOLAR_SECTIONS,
  },
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos de equipamiento escolar',
    description:
      'Registro visual de conversiones reales: butacas, distribución interior, señalética y terminaciones en taller Utilcar.',
  },
  cta: {
    title: 'Solicite equipamiento escolar a medida',
    description:
      'Relevamos su vehículo, definimos la distribución de plazas, materiales y señalética según normativa, y fabricamos con instalación en taller Utilcar.',
  },
}




const BANQUETAS_CATEGORIES = [
  {
    id: 'adultos',
    name: 'Banquetas Adultos',
    intro: [
      'Fabricamos banquetas para adultos con estructura reforzada y procesos de fabricación controlados que garantizan resistencia, seguridad y durabilidad en uso intensivo.',
    ],
    sections: [
      specSection('Características de fabricación', [
        'Estructura de tubo de 1" × 2 mm doblada mediante sistema con sensores electrónicos para mantener igualdad de curvas sin afectar la resistencia del material.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ]),
      specSection('Opciones de equipamiento', [
        'Asiento con espuma de 6 cm de alta densidad.',
        'Respaldo con espuma de 4 cm de alta densidad.',
        'Cabecera regulable opcional.',
        'Tapiz a elección del cliente.',
        'Patas en perfil rectangular 50×30 electropintadas.',
        'Cinturones de seguridad de dos puntas.',
      ]),
    ],
    extra: {
      title: 'Ventanas semi originales',
      lead: 'Contamos con juegos de ventanas semi originales pegadas y abatibles para diferentes marcas:',
      brands: ['Peugeot', 'Fiat', 'Citroën', 'Renault'],
      closing:
        'Cuentan con certificaciones de seguridad y serigrafías idénticas a las originales.',
    },
  },
  {
    id: 'traslado',
    name: 'Traslado de Personal',
    intro: [
      'Banquetas diseñadas para transporte de personal en minibuses y utilitarios, con estructura simétrica y terminaciones orientadas al uso corporativo diario.',
    ],
    sections: [
      specSection('Características de fabricación', [
        'Estructura de tubo de 1" × 2 mm doblada simétricamente.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ]),
      specSection('Opciones de equipamiento', [
        'Espuma de poliuretano de alta densidad.',
        'Cabecera fija.',
        'Tapiz a elección del cliente.',
        'Patas en perfil rectangular 50×30 electropintadas.',
        'Cinturones de seguridad de dos puntas.',
      ]),
    ],
  },
  {
    id: 'escolares',
    name: 'Escolares',
    intro: [
      'Línea de banquetas para transporte escolar, fabricadas según requerimientos de seguridad, confort y normativa de transporte de pasajeros.',
    ],
    sections: [
      specSection('Características de fabricación', [
        'Estructura de tubo de 1" × 2 mm.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ]),
      specSection('Opciones de equipamiento', [
        'Asiento con espuma de 6 cm de alta densidad.',
        'Respaldo con espuma de 4 cm de alta densidad.',
        'Cabecera regulable.',
        'Tapiz lateral en vinil liso.',
        'Tapiz de cubiertas en vinil técnico Bronco Benz.',
        'Patas en perfil rectangular 50×30 electropintadas.',
        'Cinturones de seguridad de dos puntas (uso obligatorio).',
      ]),
    ],
  },
]


export const banquetasContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Banquetas',
    subtitle:
      'Fabricación de banquetas y equipamiento para transporte de personal, minibuses y vehículos escolares.',
    imageAlt: 'Banquetas fabricadas por Utilcar para minibuses y transporte de pasajeros',
  },
  categories: {
    eyebrow: 'Líneas de producto',
    title: 'Banquetas por aplicación',
    description:
      'Tres líneas de fabricación con especificaciones técnicas, opciones de equipamiento y registro visual de trabajos reales.',
    items: BANQUETAS_CATEGORIES,
  },
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description:
      'Fabricación e instalación de banquetas registradas en proyectos reales para transporte de personal, escolar y adultos.',
  },
  cta: {
    title: 'Solicite banquetas a medida para su flota',
    description:
      'Definimos la línea de producto, distribución de plazas, tapizados y anclajes según su vehículo y normativa. Fabricación e instalación en taller Utilcar.',
  },
}




const BUTACAS_INTRO = {
  title: 'Fabricación personalizada',
  paragraphs: [
    'Fabricamos butacas a la medida y según la exigencia de cada cliente, con el más alto estándar de calidad. Contamos con matrices propias de fabricación, lo que nos permite entregar exactamente lo que cada proyecto requiere.',
    'Calidad y precio acordes al mercado.',
    'Así nos hemos propuesto un servicio diferenciado de óptima calidad: eficiencia, rapidez, puntualidad y terminaciones que facilitan al máximo el trabajo y el tiempo dedicado por el cliente.',
  ],
}

const BUTACAS_SECTIONS = [
  specSection('Fabricación a medida', [
    'Diseño y producción según requerimientos del cliente y del vehículo.',
    'Matrices propias que permiten configuraciones exactas por proyecto.',
    'Butacas para transporte de pasajeros, vehículos especiales y aplicaciones personalizadas.',
    'Instalación en riel o directamente al piso según carrocería.',
    'Asesoramiento técnico en distribución y ergonomía del habitáculo.',
  ]),
  specSection('Calidad de materiales', [
    'Estructura metálica reforzada con tratamiento anticorrosivo.',
    'Espuma de alta densidad en asiento y respaldo para confort en viajes prolongados.',
    'Tapizados técnicos resistentes al desgaste y de fácil mantenimiento.',
    'Componentes seleccionados para uso intensivo en flota.',
  ]),
  specSection('Terminaciones', [
    'Costuras y acabados de tapicería con control de detalle en taller.',
    'Tapizados premium antimanchas y terminaciones uniformes.',
    'Soporte lumbar y ergonomía orientada al confort del pasajero.',
    'Acabados alineados al estándar visual del proyecto.',
  ]),
  specSection('Personalización', [
    'Mecanismos reclinables opcionales con ajuste suave y duradero.',
    'Colores y combinaciones de tapiz según identidad del cliente.',
    'Portavasos, mesas abatibles y accesorios integrados a pedido.',
    'Cinturones de tres puntos y anclajes homologados según normativa.',
    'Configuraciones para viajes ejecutivos, turismo y transporte especializado.',
  ]),
  specSection('Compromiso de servicio', [
    'Eficiencia y rapidez en fabricación e instalación.',
    'Puntualidad en plazos acordados con el cliente.',
    'Calidad consistente en cada entrega.',
    'Mantenimiento simplificado de tapizados y mecanismos.',
    'Acompañamiento desde el relevamiento hasta la entrega en taller.',
  ]),
]


export const butacasContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Butacas',
    subtitle:
      'Fabricación de butacas a medida para transporte de pasajeros, vehículos especiales y soluciones personalizadas.',
    imageAlt: 'Butacas fabricadas a medida por Utilcar — tapizado y terminaciones premium',
  },
  intro: { eyebrow: 'Fabricación propia', ...BUTACAS_INTRO },
  specs: {
    eyebrow: 'Propuesta de valor',
    title: 'Calidad, personalización y servicio',
    description:
      'Fabricación real en taller propio: materiales seleccionados, terminaciones cuidadas y configuración según cada proyecto.',
    sections: BUTACAS_SECTIONS,
  },
  gallery: {
    eyebrow: 'Registro visual',
    title: 'Terminaciones y detalle de fabricación',
    description:
      'Tapizados, costuras, estructura y acabados de butacas fabricadas en Utilcar — calidad visible en cada proyecto.',
  },
  cta: {
    title: 'Solicite butacas personalizadas para su proyecto',
    description:
      'Relevamos su vehículo, definimos tapizados, ergonomía y opciones de equipamiento, y fabricamos con matrices propias e instalación en taller Utilcar.',
  },
}




const ACCESORIOS_PAGE_INTRO = {
  title: 'Accesorios complementarios',
  paragraphs: [
    'Utilcar fabrica e instala accesorios que complementan el equipamiento del vehículo, mejorando confort, seguridad, ergonomía, señalización y funcionalidad en cada proyecto.',
    'Cada línea se desarrolla con materiales y terminaciones acordes al uso del habitáculo, con instalación profesional en taller.',
  ],
}

const ACCESORIOS_CATEGORIES = [
  {
    id: 'cabeceras',
    name: 'Cabeceras',
    intro: [
      'Las cabeceras constituyen un accesorio esencial para prevenir molestias cervicales producidas por accidentes.',
      'Están fabricadas en estructura metálica, cubiertas en poliuretano inyectado y disponibles en diversas telas o viniles.',
    ],
    sections: [
      specSection('Seguridad y confort', [
        'Apoyo cervical que reduce el riesgo de lesiones en siniestros.',
        'Diseño orientado al confort del pasajero en viajes prolongados.',
        'Integración con el respaldo según configuración del asiento.',
      ]),
      specSection('Terminaciones', [
        'Poliuretano inyectado con acabado uniforme.',
        'Tapiz en tela o vinil según requerimiento del proyecto.',
        'Fabricación y terminación en taller Utilcar.',
      ]),
      specSection('Ergonomía', [
        'Altura y posición acordes al tipo de butaca o banqueta.',
        'Opciones de regulación según modelo de asiento.',
        'Asesoramiento técnico para selección del accesorio adecuado.',
      ]),
    ],
  },
  {
    id: 'apoya-brazos',
    name: 'Apoya Brazos',
    intro: [
      'Fabricado en estructura metálica recubierta en poliuretano inyectado.',
      'El tapiz puede ser en tela, vinil o cuero. Posee un sistema de articulación para guardarlo o levantarlo cuando se requiera.',
      'Su función principal es el descanso del brazo en viajes largos.',
    ],
    sections: [
      specSection('Comodidad y ergonomía', [
        'Descanso del brazo en viajes prolongados.',
        'Integración discreta al lateral del asiento.',
        'Mejora la ergonomía del puesto del pasajero.',
      ]),
      specSection('Materiales y tapiz', [
        'Estructura metálica con recubrimiento en poliuretano inyectado.',
        'Tapiz a elección: tela, vinil o cuero.',
        'Terminaciones resistentes al uso diario.',
      ]),
      specSection('Funcionalidad', [
        'Sistema de articulación para bajar o levantar el apoya brazos.',
        'Permite liberar espacio cuando no se utiliza.',
        'Instalación según modelo de butaca o banqueta.',
      ]),
    ],
  },
  {
    id: 'balizas',
    name: 'Balizas',
    intro: [
      'Baliza de color amarillo estereoscópica imantada, 12 volt.',
      'Elemento de señalización preventiva para transporte escolar y aplicaciones que requieren alta visibilidad en ruta.',
    ],
    sections: [
      specSection('Señalización preventiva', [
        'Mayor visibilidad del vehículo en operación escolar.',
        'Uso en conjunto con señalética reglamentaria del habitáculo.',
        'Apoyo a la seguridad vial en rutas de transporte de pasajeros.',
      ]),
      specSection('Especificación', [
        'Color amarillo estereoscópico.',
        'Fijación imantada.',
        'Alimentación 12 volt.',
      ]),
      specSection('Funcionalidad', [
        'Instalación y retiro ágil según necesidad operativa.',
        'Complemento para flotas de transporte escolar.',
        'Asesoramiento en ubicación y uso reglamentario.',
      ]),
    ],
  },
  {
    id: 'distintivo-escolar',
    name: 'Distintivo Escolar',
    intro: [
      'Señalética reglamentaria para transporte escolar. En cada cara se insertará la palabra «Escolares», con letras de 12 cm de alto y 4 cm de ancho.',
      'El fondo del letrero deberá ser de color amarillo y las letras de color negro, reflectantes o iluminadas, a objeto de permitir su óptima visualización. Queda prohibido insertar en él cualquier otra leyenda o figura.',
      'El letrero deberá ir apoyado sobre su base e instalarse mediante elementos que permitan su fijación temporal, para usarse cuando se transporten escolares.',
    ],
    sections: [
      specSection('Normativa y uso', [
        'Letrero destinado al transporte de escolares según reglamentación vigente.',
        'Prohibido insertar otras leyendas o figuras en el distintivo.',
        'Uso con fijación temporal cuando el vehículo presta servicio escolar.',
      ]),
      specSection('Dimensiones y colores', [
        'Palabra «Escolares» en cada cara del letrero.',
        'Letras de 12 cm de alto y 4 cm de ancho.',
        'Fondo amarillo y letras negras reflectantes o iluminadas.',
      ]),
      specSection('Reflectancia e instalación', [
        'Alta visibilidad diurna y nocturna.',
        'Apoyado sobre base con sistema de fijación temporal.',
        'Instalación y retiro según operación del vehículo.',
      ]),
    ],
  },
]


export const accesoriosContent = {
  hero: {
    eyebrow: 'Servicios',
    title: 'Accesorios',
    subtitle:
      'Accesorios diseñados para mejorar la comodidad, seguridad y funcionalidad de cada vehículo.',
    imageAlt: 'Cabeceras y accesorios Utilcar para equipamiento de vehículos',
  },
  intro: { eyebrow: 'Complementos', ...ACCESORIOS_PAGE_INTRO },
  catalog: {
    eyebrow: 'Catálogo técnico',
    title: 'Líneas de accesorios',
    description:
      'Seleccione una categoría para ver especificaciones, registro visual y detalle de cada producto.',
    categories: ACCESORIOS_CATEGORIES,
  },
  gallery: {
    eyebrow: 'Galería',
    title: 'Trabajos realizados',
    description:
      'Instalaciones reales de cabeceras, apoya brazos, balizas y señalética en proyectos Utilcar.',
  },
  cta: {
    title: 'Consulte accesorios para su equipamiento',
    description:
      'Asesoramos en cabeceras, apoya brazos, balizas y señalética escolar según su vehículo y normativa. Fabricación e instalación en taller Utilcar.',
  },
}

export {
  SERVICE_LINKS,
  MAIN_NAV_LINKS,
  TALLERES_INTRO,
  TALLERES_SOLUCIONES,
  TALLERES_CARACTERISTICAS,
  VENTANAS_INTRO,
  VENTANAS_BRANDS,
  ESCOLAR_INTRO,
  ESCOLAR_SECTIONS,
  BANQUETAS_CATEGORIES,
  BUTACAS_INTRO,
  BUTACAS_SECTIONS,
  ACCESORIOS_PAGE_INTRO,
  ACCESORIOS_CATEGORIES,
}
