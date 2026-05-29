import { z } from 'zod'

export const linkSchema = z.object({
  label: z.string(),
  path: z.string(),
})

export const ctaLinkSchema = z.object({
  label: z.string(),
  to: z.string(),
  ariaLabel: z.string().optional(),
})

export const sectionHeaderSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  align: z.enum(['center', 'start', 'end']).optional(),
  className: z.string().optional(),
})

export const ctaBlockSchema = z.object({
  title: z.string(),
  description: z.string(),
  primaryLabel: z.string().optional(),
  primaryTo: z.string().optional(),
})

export const specGroupSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
})

export const pageHeroSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  imageAlt: z.string().optional(),
})

/** Campo enriquecido en runtime (iconos React, URLs de assets Vite). */
export const runtimeValueSchema = z.any()
