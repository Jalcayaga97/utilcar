import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { ContactForm } from '@/components/sections/ContactForm'
import { ContactFaq } from '@/components/sections/ContactFaq'
import { Section, SectionHeader } from '@/components/ui/Section'
import { SITE } from '@/constants/site'
import { IMAGES } from '@/assets/images'
import { useContactDisplay } from '@/hooks/useCms'
import { logRuntime } from '@/lib/cms/runtimeLog'
import { cn } from '@/lib/cn'

const ease = [0.25, 0.1, 0.25, 1]
const phoneHref = `tel:${SITE.phoneTel}`

function ContactCard({ icon: Icon, title, children }) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-white p-5 transition-colors duration-300',
        'hover:border-ink/15',
      )}
    >
      <Icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 space-y-1 text-sm leading-relaxed text-ink-muted">{children}</div>
    </div>
  )
}

export default function Contacto() {
  const { content, heroImage, source } = useContactDisplay()
  const { hero, intro, details, cta, map, faq } = content

  useEffect(() => {
    logRuntime('contact-page', { source, faqItems: content.faqItems?.length ?? 0 })
  }, [source, content.faqItems?.length])

  const mapsQuery = map.embedQuery || SITE.mapsQuery

  return (
    <>
      <PageMeta page="contacto" />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={heroImage || IMAGES.talleres.hero}
        imageAlt={hero.imageAlt}
      />

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            Para mayor información puede contactarnos al correo{' '}
            <a href={`mailto:${SITE.emails[0]}`} className="font-medium text-ink underline-offset-2 hover:underline">
              {SITE.emails[0]}
            </a>{' '}
            o{' '}
            <a href={`mailto:${SITE.emails[1]}`} className="font-medium text-ink underline-offset-2 hover:underline">
              {SITE.emails[1]}
            </a>{' '}
            al teléfono{' '}
            <a href={phoneHref} className="font-medium text-ink underline-offset-2 hover:underline">
              {SITE.phoneDisplay}
            </a>
            .
          </p>
          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            {intro.formHint}
          </p>
        </motion.div>
      </Section>

      <Section id="formulario" className="bg-white scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {details.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {details.description}
              </p>
            </div>

            <ContactCard icon={Phone} title={details.cards.phone}>
              <a href={phoneHref} className="block font-medium text-ink hover:text-ink-muted">
                {SITE.phoneDisplay}
              </a>
            </ContactCard>

            <ContactCard icon={Mail} title={details.cards.email}>
              {SITE.emails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="block font-medium text-ink hover:text-ink-muted"
                >
                  {email}
                </a>
              ))}
            </ContactCard>

            <ContactCard icon={MapPin} title={details.cards.address}>
              <p className="font-medium text-ink">{SITE.addressStreet}</p>
              <p>{SITE.addressCity}</p>
              <p className="text-ink-subtle">{SITE.metro}</p>
            </ContactCard>

            <ContactCard icon={Clock} title={details.cards.hours.title}>
              <p className="font-medium text-ink">{details.cards.hours.lines[0]}</p>
              <p>{details.cards.hours.lines[1]}</p>
            </ContactCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </Section>

      <ServiceCtaDark
        title={cta.title}
        description={cta.description}
        primaryLabel={cta.primaryLabel}
        primaryTo={cta.primaryTo}
      />

      <Section>
        <SectionHeader
          eyebrow={map.eyebrow}
          title={map.title}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-10"
        >
          <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
            <div className="aspect-[16/10] w-full sm:aspect-[21/9] lg:aspect-[2.2/1]">
              <iframe
                title={map.iframeTitle}
                src={`https://maps.google.com/maps?q=${mapsQuery}&hl=es&z=16&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="border-t border-border px-5 py-4 sm:px-6 sm:py-5">
              <p className="text-sm font-semibold text-ink">{SITE.legalName}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {SITE.addressStreet}, {SITE.addressCity}.
              </p>
              <p className="mt-1 text-sm text-ink-subtle">{SITE.metro}</p>
            </div>
          </div>
        </motion.div>
      </Section>

      <Section className="bg-white">
        <SectionHeader
          eyebrow={faq.eyebrow}
          title={faq.title}
          description={faq.description}
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease }}
          className="mt-10"
        >
          <ContactFaq />
        </motion.div>
      </Section>
    </>
  )
}
