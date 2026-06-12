import { z } from 'zod'
import {
  ctaBlockSchema,
  linkSchema,
  pageHeroSchema,
  runtimeValueSchema,
  sectionHeaderSchema,
  specGroupSchema,
} from './shared'

export const ServiceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  path: z.string(),
  imageAlt: z.string().optional(),
  icon: runtimeValueSchema,
})

export const HighlightItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: runtimeValueSchema,
})

export const ServicePageContentSchema = z
  .object({
    hero: pageHeroSchema,
    intro: sectionHeaderSchema
      .extend({ paragraphs: z.array(z.string()).optional() })
      .passthrough(),
    scope: sectionHeaderSchema
      .extend({
        lists: z
          .record(
            z.string(),
            z.object({ title: z.string(), items: z.array(z.string()) }),
          )
          .optional(),
      })
      .passthrough(),
    gallery: sectionHeaderSchema.optional(),
    specs: sectionHeaderSchema
      .extend({ sections: z.array(specGroupSchema).optional() })
      .passthrough(),
    categories: sectionHeaderSchema
      .extend({ items: z.array(z.any()).optional() })
      .passthrough(),
    catalog: sectionHeaderSchema
      .extend({ categories: z.array(z.any()).optional() })
      .passthrough(),
    brands: sectionHeaderSchema.optional(),
    cta: ctaBlockSchema.optional(),
  })
  .passthrough()

export const BrandCategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    models: z.array(z.string()).optional(),
    subtitle: z.string().optional(),
    intro: z.array(z.string()).optional(),
    sections: z.array(specGroupSchema),
    extra: z
      .object({
        title: z.string(),
        lead: z.string(),
        brands: z.array(z.string()),
        closing: z.string(),
      })
      .optional(),
  })
  .passthrough()

export const ServicesBundleSchema = z.object({
  services: z.array(ServiceItemSchema),
  highlights: z.array(HighlightItemSchema),
  serviceLinks: z.array(linkSchema),
  mainNavLinks: z.array(linkSchema),
  servicePaths: z.array(z.string()),
  serviceCtaDefaults: ctaBlockSchema,
  ctaButtonLabels: z.object({
    primaryLabel: z.string(),
    primaryTo: z.string(),
    whatsAppLabel: z.string(),
  }),
  talleresMoviles: ServicePageContentSchema,
  ventanasLunetas: ServicePageContentSchema,
  equipamientoEscolar: ServicePageContentSchema,
  banquetas: ServicePageContentSchema,
  butacas: ServicePageContentSchema,
  accesorios: ServicePageContentSchema,
  proteccionCabina: ServicePageContentSchema,
  cambioPisos: ServicePageContentSchema,
  reclinaciones: ServicePageContentSchema,
  fundas: ServicePageContentSchema,
  literas: ServicePageContentSchema,
  tapiceria: ServicePageContentSchema,
  equipamientoMarcaTabs: z.array(BrandCategorySchema),
  banquetasCategories: z.array(BrandCategorySchema),
  butacasCategories: z.array(BrandCategorySchema),
  accesoriosCategories: z.array(BrandCategorySchema),
  tapiceriaCategories: z.array(BrandCategorySchema),
})
