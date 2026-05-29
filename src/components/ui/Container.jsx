import { cn } from '@/lib/cn'

const sizes = {
  default: 'max-w-7xl',
  narrow: 'max-w-4xl',
  wide: 'max-w-[90rem]',
}

export function Container({
  as: Component = 'div',
  size = 'default',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
