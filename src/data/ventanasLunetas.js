/**
 * Contenido técnico Ventanas y Lunetas — basado en utilcar.cl/ventanas.html
 * y equipamiento por marca de conversiones Utilcar.
 */

export const VENTANAS_INTRO = {
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

const section = (title, items) => ({ title, items })

/** Equipamiento por marca — categorías: Ventanas, Asientos, Seguridad, Interior, Opcionales */
export const VENTANAS_BRANDS = [
  {
    id: 'toyota',
    name: 'Toyota',
    models: ['Hiace', 'Hilux', 'Proace / Proace City'],
    sections: [
      section('Ventanas', [
        'Ventanas corredizas laterales en marco de aluminio electropintado.',
        'Luneta trasera y ventiletes según versión de carrocería.',
        'Vidrios templados con seguro perforado.',
        'Kits para Hiace de transporte escolar y uso mixto.',
      ]),
      section('Asientos', [
        'Butacas y banquetas para Hiace y Proace.',
        'Distribuciones 2+1, 3+0 y personalizadas.',
        'Espuma de alta densidad en asiento y respaldo.',
      ]),
      section('Seguridad', [
        'Cinturones de seguridad de dos puntas.',
        'Balizas y señalética según normativa de transporte.',
        'Anclajes al piso certificados.',
      ]),
      section('Interior', [
        'Revestimiento interior en madera o material a elección.',
        'Piso antideslizante en zona de carga.',
        'Iluminación LED perimetral opcional.',
      ]),
      section('Opcionales', [
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
      section('Ventanas', [
        'Ventiletes y lunetas para Boxer y Expert (chasis K0).',
        'Ventanas corredizas de 2.ª y 3.ª fila según batalla (L2 / L3).',
        'Sustitución o apertura de huecos a medida en carrocería.',
        'Vidrio templado tintado según aplicación.',
      ]),
      section('Asientos', [
        'Banquetas modulares para Boxer escolar y turismo.',
        'Butacas individuales para Traveller ejecutivo.',
        'Tapizados en vinil técnico Bronco Benz u opción a elección.',
      ]),
      section('Seguridad', [
        'Cinturones en todas las plazas homologadas.',
        'Letrero reglamentario de tres caras.',
        'Sistema de balizas para transporte escolar.',
      ]),
      section('Interior', [
        'Forrado de interiores y terminaciones en zona habitáculo.',
        'Pasillos y accesos según reglamento.',
        'Revestimientos sanitizables.',
      ]),
      section('Opcionales', [
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
      section('Ventanas', [
        'Kit de ventanas laterales para Master.',
        'Ventilete corredizo y luneta trasera.',
        'Ventanas para Kangoo de reparto y escolar.',
        'Sellado profesional con burletes técnicos.',
      ]),
      section('Asientos', [
        'Equipamiento escolar en Master con butacas homologadas.',
        'Banquetas para traslado de personal en Trafic.',
        'Patas en perfil 50×30 electropintado.',
      ]),
      section('Seguridad', [
        'Instalación según reglamentos del Ministerio de Transporte.',
        'Salidas de emergencia señalizadas.',
        'Cinturones de dos puntas en todas las plazas.',
      ]),
      section('Interior', [
        'Revestimiento de piso y laterales.',
        'Compartimientos para herramientas en versiones técnicas.',
        'Aislación y terminación perimetral.',
      ]),
      section('Opcionales', [
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
      section('Ventanas', [
        'Ventanas laterales para utilitarios compactos.',
        'Luneta trasera a medida.',
        'Marco de aluminio electropintado con felpa.',
        'Vidrios templados de seguridad.',
      ]),
      section('Asientos', [
        'Banquetas para transporte urbano y escolar.',
        'Redistribución de plazas según habilitación.',
        'Tapiz en vinil liso de alta resistencia.',
      ]),
      section('Seguridad', [
        'Cinturones según normativa vigente.',
        'Cartelería de identificación escolar.',
        'Fijaciones reforzadas al chasis del vehículo.',
      ]),
      section('Interior', [
        'Revestimiento básico o premium según uso.',
        'Piso en material antideslizante.',
        'Protección de paneles interiores.',
      ]),
      section('Opcionales', [
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
      section('Ventanas', [
        'Ventanas corredizas y fijas para Ducato (chasis X250 / X290).',
        'Lunetas de doble puerta trasera.',
        'Ventiletes para Fiorino y Scudo.',
        'Compatibilidad con batallas L1, L2, L3 y L4.',
      ]),
      section('Asientos', [
        'Butacas y banquetas para Ducato escolar y corporativo.',
        'Configuración de pasillo central homologado.',
        'Espuma 6 cm asiento / 4 cm respaldo.',
      ]),
      section('Seguridad', [
        'Homologación para transporte de pasajeros.',
        'Balizas y letreros reglamentarios.',
        'Anclajes testeados en piso.',
      ]),
      section('Interior', [
        'Forrado completo de habitáculo.',
        'Revestimiento en zona de carga.',
        'Terminaciones en cantos y uniones.',
      ]),
      section('Opcionales', [
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
      section('Ventanas', [
        'Ventanas corredizas para Jumper (equivalente Boxer / Ducato).',
        'Luneta y ventiletes para Berlingo.',
        'Kits para Spacetourer de pasajeros.',
        'Cristales templados con tratamiento de seguridad.',
      ]),
      section('Asientos', [
        'Equipamiento de butacas para transporte escolar.',
        'Banquetas en configuraciones múltiples.',
        'Cabecera regulable opcional.',
      ]),
      section('Seguridad', [
        'Cumplimiento normativa Ministerio de Transporte.',
        'Cinturones de dos puntas obligatorios.',
        'Señalética y balizas homologadas.',
      ]),
      section('Interior', [
        'Tapicería y revestimientos interiores.',
        'Pisos técnicos para alto tránsito.',
        'Paneles laterales forrados.',
      ]),
      section('Opcionales', [
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
      section('Ventanas', [
        '2 ventanas de corredera en marco de aluminio electropintado, con botaguas y felpa importada para el deslizamiento de vidrios.',
        'Vidrios templados con seguro perforado.',
      ]),
      section('Asientos', [
        'Asiento adulto tipo banqueta abatible, fabricado en tubo de 2 mm.',
        'Disponible en dos modelos de sujeción: por seguro o por correas.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados para mayor resistencia y funcionamiento uniforme.',
        'Espuma de poliuretano de alta densidad.',
        'Tapiz combinado en vinil con tela a elección.',
      ]),
      section('Seguridad', [
        '3 cinturones de seguridad de 2 puntas.',
      ]),
      section('Interior', [
        '2 asientos laterales abatibles traseros.',
        'Forrado de costados.',
        'Forrado de cielo interior.',
      ]),
      section('Opcionales', [
        'Hasta 3 cabeceras regulables en la banqueta principal.',
      ]),
    ],
  },
]
