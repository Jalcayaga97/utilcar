/** Fixture draft — Buses escolares (categoría simple sin marcas). */
export const busesEscolaresCategoryFixture = {
  _key: 'cat-escolar',
  id: 'escolar',
  title: 'Conversión de Buses Escolares',
  subtitle: 'Equipamiento Escolar',
  intro:
    'Nuestros equipamientos escolares cumplen con todas las normas exigidas por el Ministerio de Transporte, utilizando materiales pensados para ofrecer seguridad, resistencia y larga vida útil.',
  imageAlt: 'Equipamiento escolar en bus de transporte de pasajeros',
  heroImage: {
    url: 'https://cdn.example.local/escolar/ee350.jpg',
    alt: 'Equipamiento escolar en bus de transporte de pasajeros',
  },
  specGroups: [
    {
      title: 'Características del equipamiento',
      items: [
        'Asiento de espuma de 6 cm de alta densidad.',
        'Respaldo de espuma de 4 cm de alta densidad.',
        'Cabecera regulable opcional.',
        'Cinturones de seguridad de dos puntas (uso obligatorio).',
        'Letrero de tres caras y sistema de balizas.',
        'Instalación ajustada a los reglamentos del Ministerio de Transporte.',
      ],
    },
  ],
  cta: { label: 'Ver equipamiento escolar', path: '/equipamiento-escolar' },
  brands: [],
}

export const busesEscolaresBlockFixture = {
  _type: 'specialtiesBlock',
  eyebrow: 'Especialidades',
  title: 'Especialidades Utilcar',
  description: 'Equipamiento certificado para transporte escolar.',
  categories: [busesEscolaresCategoryFixture],
}
