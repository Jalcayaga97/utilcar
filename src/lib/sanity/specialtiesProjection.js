/** Proyección GROQ — specialtiesBlock.categories[] (Runtime V2). */
export const SPECIALTIES_CATEGORY_PROJECTION = `{
  _key,
  title,
  subtitle,
  slug,
  description,
  featured,
  enabled,
  heroImage{
    asset->{ _id, url },
    alt
  },
  heroImageAlt,
  gallery[]{
    _key,
    image{
      asset->{ _id, url },
      alt
    },
    alt,
    role,
    caption,
    featured
  },
  features[]{
    _key,
    title,
    items[],
    kind
  },
  cta{
    label,
    to,
    ariaLabel,
    styleVariant
  },
  brands[]{
    _key,
    title,
    subtitle,
    featured,
    brandRef->{ _id, name, slug, logo{ asset->{ url } } },
    logo{
      asset->{ _id, url },
      alt
    },
    heroImage{
      asset->{ _id, url },
      alt
    },
    galleries[]{
      _key,
      image{
        asset->{ _id, url },
        alt
      },
      alt,
      role,
      caption,
      featured
    },
    features[]{
      _key,
      title,
      items[],
      kind
    },
    cta{
      label,
      to,
      ariaLabel,
      styleVariant
    }
  },
  layoutConfig{
    variant,
    showBrandTabs,
    columns,
    imagePosition,
    dense
  }
}`
