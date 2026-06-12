import { z } from 'zod'
import { ctaBlockSchema, pageHeroSchema } from './shared'

const featureGridItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.any().optional(),
  _key: z.string().optional(),
})

export const AboutContentSchema = z.object({
  hero: pageHeroSchema,
  historia: z.object({
    eyebrow: z.string().optional().default(''),
    title: z.string(),
    paragraphs: z.array(z.string()).default([]),
  }),
  features: z.object({
    eyebrow: z.string().optional().default(''),
    title: z.string(),
    description: z.string().optional().default(''),
    items: z.array(featureGridItemSchema).default([]),
  }),
  cta: ctaBlockSchema,
})
