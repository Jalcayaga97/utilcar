import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { BRAND } from '@/constants/site'

const sizes = {
  /** Logo horizontal en navbar — protagonista, sin deformar */
  navbar:
    'h-11 w-auto max-h-[2.875rem] sm:h-12 sm:max-h-12 max-w-[11.5rem] sm:max-w-[13.5rem] lg:max-w-[14.5rem]',
  footer: 'h-14 w-auto sm:h-16',
}

export function Logo({
  variant = 'navbar',
  className,
  link = true,
  onClick,
}) {
  const image = (
    <img
      src={BRAND.logo}
      alt={BRAND.logoAlt}
      className={cn(
        'block object-contain object-left',
        sizes[variant],
        className,
      )}
      decoding="async"
      loading={variant === 'navbar' ? 'eager' : 'lazy'}
      fetchPriority={variant === 'navbar' ? 'high' : 'auto'}
    />
  )

  if (!link) {
    return <span className="inline-flex shrink-0 items-center">{image}</span>
  }

  return (
    <Link
      to="/"
      onClick={onClick}
      className="inline-flex shrink-0 items-center focus-visible:outline-offset-4"
      aria-label={`${BRAND.logoAlt} — Inicio`}
    >
      {image}
    </Link>
  )
}
