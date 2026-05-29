/** Fixture draft — Banquetas (spec groups múltiples, sin marcas). */
export const banquetasCategoryFixture = {
  _key: 'cat-banquetas',
  id: 'banquetas',
  title: 'Fabricación de Banquetas',
  subtitle: 'Banquetas para Mini Buses',
  intro:
    'Fabricamos banquetas para minibuses utilizando estructuras reforzadas y procesos de fabricación que garantizan resistencia, seguridad y durabilidad.',
  imageAlt: 'Banquetas para minibuses fabricadas por Utilcar',
  heroImage: {
    url: 'https://cdn.example.local/banquetas/banq_esc.jpg',
    alt: 'Banquetas para minibuses fabricadas por Utilcar',
  },
  specGroups: [
    {
      title: 'Características de fabricación',
      items: [
        'Estructura de tubo de 1" × 2 mm doblada mediante sistema con sensores electrónicos.',
        'Soldadura MIG para mayor firmeza estructural.',
        'Parrilla de suspensión con resortes de acero inoxidable entrelazados.',
      ],
    },
    {
      title: 'Opciones de equipamiento',
      items: [
        'Asiento de espuma de 6 cm de alta densidad.',
        'Respaldo de espuma de 4 cm de alta densidad.',
        'Tapiz a elección del cliente.',
        'Cinturones de seguridad de dos puntas.',
      ],
    },
  ],
  cta: { label: 'Ver banquetas', path: '/banquetas' },
  gallery: [
    {
      _key: 'gal-banquetas-1',
      image: {
        url: 'https://cdn.example.local/banquetas/banq_esc1.jpg',
        alt: 'Banqueta escolar instalada',
      },
      featured: true,
    },
  ],
  brands: [],
}

export const banquetasBlockFixture = {
  _type: 'specialtiesBlock',
  eyebrow: 'Especialidades',
  title: 'Especialidades Utilcar',
  description: 'Banquetas modulares para vans y minibuses.',
  categories: [banquetasCategoryFixture],
}
