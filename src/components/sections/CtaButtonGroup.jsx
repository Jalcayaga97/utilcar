import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useCompanyInfo, useCtaButtonLabels } from '@/hooks/useCms'
import { cn } from '@/lib/cn'

const btnBase = cn(
  'inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-button px-8',
  'text-sm font-medium tracking-tight',
  'transition-all duration-300 ease-out',
  'sm:w-auto sm:min-w-[13.5rem]',
)

const variants = {
  dark: {
    primary: cn(
      btnBase,
      'border border-white bg-white text-ink',
      'hover:border-white hover:bg-transparent hover:text-white',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
    ),
    secondary: cn(
      btnBase,
      'border border-ink bg-ink text-white',
      'hover:border-white hover:bg-white hover:text-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
    ),
  },
  light: {
    primary: cn(
      btnBase,
      'border border-accent bg-accent text-surface',
      'hover:border-ink hover:bg-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    ),
    secondary: cn(
      btnBase,
      'border border-border bg-white text-ink',
      'hover:border-ink hover:bg-surface',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    ),
  },
  hero: {
    primary: cn(
      btnBase,
      'border border-border bg-white text-ink shadow-sm',
      'hover:border-ink hover:bg-ink hover:text-white',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    ),
    secondary: cn(
      btnBase,
      'border border-ink bg-ink text-white',
      'hover:border-ink hover:bg-white hover:text-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    ),
  },
}

export function CtaButtonGroup({
  variant = 'dark',
  primaryLabel,
  primaryTo,
  className,
  showWhatsApp = true,
  align = 'center',
}) {
  const labels = useCtaButtonLabels()
  const company = useCompanyInfo()
  const resolvedPrimaryLabel = primaryLabel ?? labels.primaryLabel
  const resolvedPrimaryTo = primaryTo ?? labels.primaryTo
  const styles = variants[variant] ?? variants.dark
  const isHashLink = resolvedPrimaryTo.startsWith('#')
  const PrimaryTag = isHashLink ? 'a' : Link
  const primaryProps = isHashLink
    ? { href: resolvedPrimaryTo }
    : { to: resolvedPrimaryTo }

  return (
    <div
      className={cn(
        'flex flex-col items-stretch gap-3 sm:flex-row sm:items-center',
        align === 'start' ? 'sm:justify-start' : 'sm:justify-center',
        className,
      )}
    >
      <PrimaryTag
        {...primaryProps}
        className={styles.primary}
        aria-label={
          isHashLink ? resolvedPrimaryLabel : `${resolvedPrimaryLabel} — Utilcar Conversiones`
        }
      >
        {resolvedPrimaryLabel}
        <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      </PrimaryTag>

      {showWhatsApp && (
        <a
          href={company.whatsappUrl}
          className={styles.secondary}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar a Utilcar por WhatsApp"
        >
          <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          {labels.whatsAppLabel}
        </a>
      )}
    </div>
  )
}
