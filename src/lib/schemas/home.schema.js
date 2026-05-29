import { z } from 'zod'
import { ctaBlockSchema, ctaLinkSchema, linkSchema, runtimeValueSchema, specGroupSchema } from './shared'

export const HomeContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    highlights: z.array(z.string()),
    secondaryLink: ctaLinkSchema,
    imageAlt: z.string(),
  }),
  services: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    cardLinkLabel: z.string(),
  }),
  especialidades: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    itemEyebrowPrefix: z.string(),
  }),
  highlights: z.object({
    eyebrow: z.string(),
    title: z.string(),
  }),
  portfolioPreview: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    ctaLabel: z.string(),
    ctaTo: z.string(),
    previewCount: z.number().int().positive(),
  }),
  ctaBanner: ctaBlockSchema,
})

export const EspecialidadSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  intro: z.string(),
  specGroups: z.array(specGroupSchema),
  cta: linkSchema,
  image: runtimeValueSchema,
  imageAlt: z.string(),
})

export const EspecialidadesSchema = z.array(EspecialidadSchema)

export const HomeBundleSchema = z.object({
  homeContent: HomeContentSchema,
  especialidades: EspecialidadesSchema,
})
