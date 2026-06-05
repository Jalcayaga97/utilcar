import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { ContactForm } from '@/components/sections/ContactForm'
import { ContactFaq } from '@/components/sections/ContactFaq'
import { Section, SectionHeader } from '@/components/ui/Section'
import { IMAGES } from '@/assets/images'
import { useCompanyInfo, useContactPageDisplay } from '@/hooks/useCms'
import { logRuntime } from '@/lib/cms/runtimeLog'
import { cn } from '@/lib/cn'

const ease = [0.25, 0.1, 0.25, 1]

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
  const { content, heroImage, seo, source } = useContactPageDisplay()
  const company = useCompanyInfo()
  const { hero, intro, details, cta, map, faq } = content

  useEffect(() => {
    logRuntime('contact-page', {
      source,
      companySource: company.source,
      faqItems: content.faqItems?.length ?? 0,
    })
  }, [source, company.source, content.faqItems?.length])

  const mapsQuery = company.mapsEmbedQuery

  return (
    <>
      <PageMeta page="contacto" cmsSeo={seo ?? undefined} />

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
          {intro.paragraphs?.length ? (
            intro.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-relaxed text-ink-muted sm:text-lg"
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
              Para mayor información puede contactarnos al correo{' '}
              <a
                href={`mailto:${company.primaryEmail}`}
                className="font-medium text-ink underline-offset-2 hover:underline"
              >
                {company.primaryEmail}
              </a>
              {company.secondaryEmail ? (
                <>
                  {' '}
                  o{' '}
                  <a
                    href={`mailto:${company.secondaryEmail}`}
                    className="font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {company.secondaryEmail}
                  </a>
                </>
              ) : null}{' '}
              al teléfono{' '}
              <a
                href={company.phoneTel}
                className="font-medium text-ink underline-offset-2 hover:underline"
              >
                {company.phoneDisplay}
              </a>
              .
            </p>
          )}
          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            {intro.formHint}
          </p>
        </motion.div>
      </Section>

      <Section id="formulario" className="scroll-mt-24 bg-white">
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
              <a
                href={company.phoneTel}
                className="block font-medium text-ink hover:text-ink-muted"
              >
                {company.phoneDisplay}
              </a>
              {company.secondaryPhone ? (
                <a
                  href={company.secondaryPhoneTel}
                  className="block font-medium text-ink hover:text-ink-muted"
                >
                  {company.secondaryPhone}
                </a>
              ) : null}
            </ContactCard>

            <ContactCard icon={Mail} title={details.cards.email}>
              {company.emails.map((email) => (
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
              <p className="font-medium text-ink">{company.addressStreet}</p>
              <p>{company.addressCity}</p>
              <p className="text-ink-subtle">{company.metro}</p>
            </ContactCard>

            <ContactCard icon={Clock} title={details.cards.hours.title}>
              {company.openingHoursLines.map((line) => (
                <p key={line} className={line === company.openingHoursLines[0] ? 'font-medium text-ink' : ''}>
                  {line}
                </p>
              ))}
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
              <p className="text-sm font-semibold text-ink">{company.legalName}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {company.addressStreet}, {company.addressCity}.
              </p>
              <p className="mt-1 text-sm text-ink-subtle">{company.metro}</p>
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
