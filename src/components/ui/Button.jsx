import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-accent text-surface hover:bg-accent-hover border border-transparent',
  secondary:
    'bg-white text-ink border border-border hover:border-ink/20 hover:bg-surface',
  ghost: 'bg-transparent text-ink hover:bg-ink/5 border border-transparent',
  outline:
    'bg-transparent text-ink border border-border hover:border-ink/30 hover:bg-white',
}

const sizes = {
  xs: 'px-3.5 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  children,
  to,
  href,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-button font-medium tracking-tight transition-colors duration-200 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
