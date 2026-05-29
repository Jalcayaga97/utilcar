/** Fixture draft — Ventanas / Furgones con marcas anidadas. */
export const ventanasCategoryFixture = {
  _key: 'cat-ventanas',
  id: 'furgones',
  title: 'Equipamiento para Furgones',
  subtitle: 'Instalación de vidrios laterales',
  intro:
    'Nuestra empresa ofrece instalación de ventanas para todo tipo de furgones, utilizando materiales de alta calidad y terminaciones profesionales.',
  imageAlt:
    'Ventanas laterales corredizas para furgón — marco de aluminio electropintado y vidrio templado',
  heroImage: {
    url: 'https://cdn.example.local/ventanas/vent2.jpg',
    alt: 'Ventanas laterales corredizas para furgón',
  },
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
  layout: { variant: 'alternating', showBrandTabs: true },
  brands: [
    {
      _key: 'brand-toyota',
      id: 'toyota',
      name: 'Toyota',
      description: 'Kits de ventiletes para Hiace y Hilux.',
      logo: { url: 'https://cdn.example.local/marcas/toyota.jpg', alt: 'Toyota' },
      features: [
        {
          groupTitle: 'Compatibilidad',
          items: ['Hiace', 'Hilux', 'Land Cruiser 70'],
          kind: 'spec',
        },
      ],
      gallery: [
        {
          _key: 'gal-toyota-1',
          image: { url: 'https://cdn.example.local/ventanas/toyota-1.jpg', alt: 'Ventana Toyota Hiace' },
          featured: true,
        },
      ],
      cta: { label: 'Ver ventanas Toyota', to: '/ventanas-lunetas#toyota' },
    },
    {
      _key: 'brand-peugeot',
      id: 'peugeot',
      name: 'Peugeot',
      description: 'Ventiletes para Boxer y Partner.',
      logo: { url: 'https://cdn.example.local/marcas/peugeot.jpg', alt: 'Peugeot' },
      features: [
        { groupTitle: 'Compatibilidad', items: ['Boxer', 'Partner'], kind: 'spec' },
      ],
      gallery: [
        {
          _key: 'gal-peugeot-1',
          image: { url: 'https://cdn.example.local/ventanas/peugeot-1.jpg', alt: 'Ventana Peugeot Boxer' },
        },
      ],
      cta: { label: 'Ver ventanas Peugeot', to: '/ventanas-lunetas#peugeot' },
    },
  ],
}

export const ventanasBlockFixture = {
  _type: 'specialtiesBlock',
  eyebrow: 'Especialidades',
  title: 'Especialidades Utilcar',
  description:
    'Ingeniería, fabricación e instalación con materiales certificados, procesos controlados y cumplimiento normativo.',
  itemEyebrowPrefix: 'Especialidad',
  categories: [ventanasCategoryFixture],
}
