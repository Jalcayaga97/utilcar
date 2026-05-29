import { z } from 'zod'
import { ctaBlockSchema, pageHeroSchema, runtimeValueSchema } from './shared'

export const WorkFilterSchema = z.object({
  id: z.string(),
  label: z.string(),
})

export const PortfolioItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  categoryId: z.string(),
  image: runtimeValueSchema,
  description: z.string(),
  imageAlt: z.string().optional(),
})

export const WorkPreviewItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  imageAlt: z.string().optional(),
  imageKey: z.number().int().optional(),
})

export const WorkContentSchema = z.object({
  page: z.object({
    hero: pageHeroSchema,
    intro: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      paragraphs: z.array(z.string()),
    }),
    projects: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
    }),
    cta: ctaBlockSchema,
  }),
  filters: z.array(WorkFilterSchema),
  portfolio: z.array(PortfolioItemSchema),
  preview: z.array(WorkPreviewItemSchema),
  ui: z.object({
    emptyMessage: z.string(),
    loadMoreLabel: z.string(),
    pageSize: z.number().int().positive(),
    filterAriaLabel: z.string(),
  }),
})

export const WorkBundleSchema = z.object({
  workContent: WorkContentSchema,
  trabajosPageHero: runtimeValueSchema,
})
