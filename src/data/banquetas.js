/**
 * Contenido técnico Banquetas — líneas por categoría (utilcar.cl).
 */

const section = (title, items) => ({ title, items })

export const BANQUETAS_CATEGORIES = [
  {
    id: 'adultos',
    name: 'Banquetas Adultos',
    intro: [
      'Fabricamos banquetas para adultos con estructura reforzada y procesos de fabricación controlados que garantizan resistencia, seguridad y durabilidad en uso intensivo.',
    ],
    sections: [
      section('Características de fabricación', [
        'Estructura de tubo de 1" × 2 mm doblada mediante sistema con sensores electrónicos para mantener igualdad de curvas sin afectar la resistencia del material.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ]),
      section('Opciones de equipamiento', [
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
      section('Características de fabricación', [
        'Estructura de tubo de 1" × 2 mm doblada simétricamente.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ]),
      section('Opciones de equipamiento', [
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
      section('Características de fabricación', [
        'Estructura de tubo de 1" × 2 mm.',
        'Soldadura con equipo MIG para mayor resistencia estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ]),
      section('Opciones de equipamiento', [
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
