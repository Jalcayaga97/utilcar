/**
 * Marcas oficiales — Equipamiento Escolar (CMS + fallback local).
 * Orden fijo: 14 pestañas según listado Utilcar.
 */
const specSection = (title, items) => ({ title, items })

function escolarBrandSections(brandName) {
  return [
    specSection('Equipamiento escolar', [
      `Butacas y banquetas homologadas para transporte escolar en vehículos ${brandName}.`,
      'Espuma de poliuretano de alta densidad: 6 cm en asiento y 4 cm en respaldo.',
      'Tapiz en vinil técnico Bronco Benz u opción a elección.',
      'Patas en perfil rectangular 50×30 electropintado.',
      'Instalación profesional en taller Utilcar.',
    ]),
    specSection('Ventanas y lunetas', [
      'Ventanas corredizas laterales en marco de aluminio electropintado.',
      'Luneta trasera y ventiletes según versión de carrocería.',
      'Vidrios templados con seguro perforado.',
      'Sellado profesional con burletes técnicos.',
    ]),
    specSection('Seguridad', [
      'Cinturones de seguridad de dos puntas en plazas homologadas.',
      'Letrero reglamentario de tres caras.',
      'Sistema de balizas para transporte escolar.',
      'Cumplimiento de reglamentos del Ministerio de Transporte.',
    ]),
    specSection('Interior', [
      'Revestimientos interiores resistentes y de fácil sanitización.',
      'Forrado de costados y cielo según proyecto.',
      'Piso técnico antideslizante en zona de tránsito.',
      'Terminaciones en cantos y uniones.',
    ]),
    specSection('Opcionales', [
      'Cabeceras regulables.',
      'Malla de seguridad en ventanas.',
      'Iluminación LED perimetral.',
      'Climatización posterior según proyecto.',
    ]),
  ]
}

export const EQUIPAMIENTO_MARCA_TABS = [
  {
    id: 'peugeot',
    name: 'Peugeot',
    models: ['Boxer', 'Partner', 'Expert / Traveller'],
    sections: [
      specSection('Equipamiento escolar', [
        'Banquetas modulares para Boxer escolar y turismo.',
        'Butacas individuales para Traveller ejecutivo.',
        'Tapizados en vinil técnico Bronco Benz u opción a elección.',
        'Distribuciones 2+1, 3+0 y personalizadas.',
      ]),
      specSection('Ventanas y lunetas', [
        'Ventiletes y lunetas para Boxer y Expert (chasis K0).',
        'Ventanas corredizas de 2.ª y 3.ª fila según batalla (L2 / L3).',
        'Vidrio templado tintado según aplicación.',
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
    id: 'mercedes-benz',
    name: 'Mercedes-Benz',
    models: ['Sprinter', 'Vito', 'O500'],
    sections: escolarBrandSections('Mercedes-Benz'),
  },
  {
    id: 'maxus',
    name: 'Maxus',
    models: ['V80', 'G10', 'Deliver 9'],
    sections: escolarBrandSections('Maxus'),
  },
  {
    id: 'fiat',
    name: 'Fiat',
    models: ['Ducato', 'Fiorino', 'Scudo'],
    sections: [
      specSection('Equipamiento escolar', [
        'Butacas y banquetas para Ducato escolar y corporativo.',
        'Configuración de pasillo central homologado.',
        'Espuma 6 cm asiento / 4 cm respaldo.',
      ]),
      specSection('Ventanas y lunetas', [
        'Ventanas corredizas y fijas para Ducato (chasis X250 / X290).',
        'Lunetas de doble puerta trasera.',
        'Ventiletes para Fiorino y Scudo.',
        'Compatibilidad con batallas L1, L2, L3 y L4.',
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
    id: 'ford',
    name: 'Ford',
    models: ['Transit', 'Ranger', 'E-Series'],
    sections: escolarBrandSections('Ford'),
  },
  {
    id: 'nissan',
    name: 'Nissan',
    models: ['Urvan', 'NV350', 'Civilian'],
    sections: escolarBrandSections('Nissan'),
  },
  {
    id: 'jac',
    name: 'JAC',
    models: ['Sunray', 'N-Series'],
    sections: escolarBrandSections('JAC'),
  },
  {
    id: 'jmc',
    name: 'JMC',
    models: ['N800', 'Vigus', 'Carrying'],
    sections: escolarBrandSections('JMC'),
  },
  {
    id: 'foton',
    name: 'Foton',
    models: ['View', 'Toano', 'Aumark'],
    sections: escolarBrandSections('Foton'),
  },
  {
    id: 'yutong',
    name: 'Yutong',
    models: ['ZK6729', 'ZK6908', 'ZK6122'],
    sections: escolarBrandSections('Yutong'),
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    models: ['H350', 'County', 'Universe'],
    sections: escolarBrandSections('Hyundai'),
  },
  {
    id: 'volkswagen',
    name: 'Volkswagen',
    models: ['Crafter', 'Transporter', 'Amarok'],
    sections: escolarBrandSections('Volkswagen'),
  },
  {
    id: 'brilliance',
    name: 'Brilliance',
    models: ['Jinbei', 'Huasong', 'Haise'],
    sections: escolarBrandSections('Brilliance'),
  },
  {
    id: 'iveco',
    name: 'Iveco',
    models: ['Daily', 'Eurocargo', 'S-Way'],
    sections: escolarBrandSections('Iveco'),
  },
]

/** Alias explícito para auditorías y scripts. */
export const EQUIPAMIENTO_ESCOLAR_BRANDS = EQUIPAMIENTO_MARCA_TABS
