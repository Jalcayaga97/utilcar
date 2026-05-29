import { z } from 'zod'
import { ctaBlockSchema, pageHeroSchema } from './shared'

const formFieldSchema = z.object({
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
})

export const ContactContentSchema = z.object({
  hero: pageHeroSchema,
  intro: z.object({
    formHint: z.string(),
  }),
  details: z.object({
    title: z.string(),
    description: z.string(),
    cards: z.object({
      phone: z.string(),
      email: z.string(),
      address: z.string(),
      hours: z.object({
        title: z.string(),
        lines: z.array(z.string()),
      }),
    }),
  }),
  cta: ctaBlockSchema,
  map: z.object({
    eyebrow: z.string(),
    title: z.string(),
    iframeTitle: z.string(),
  }),
  faq: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
  }),
  form: z.object({
    heading: z.string(),
    fields: z.object({
      nombre: formFieldSchema,
      empresa: formFieldSchema,
      mail: formFieldSchema,
      telefono: formFieldSchema,
      fax: formFieldSchema,
      servicio: formFieldSchema,
      consulta: formFieldSchema,
    }),
    submit: z.object({
      idle: z.string(),
      loading: z.string(),
    }),
    success: z.object({
      title: z.string(),
      message: z.string(),
      resetLabel: z.string(),
    }),
    error: z.string(),
  }),
  servicios: z.array(z.string()),
  faqItems: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    }),
  ),
})
