import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export function Card({
  className,
  children,
  hover = false,
  as: Component = 'div',
  ...props
}) {
  const MotionComponent = hover ? motion.div : Component
  const motionProps = hover
    ? {
        whileHover: { y: -4 },
        transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
      }
    : {}

  return (
    <MotionComponent
      className={cn(
        'rounded-card border border-border bg-white p-6 shadow-card',
        hover && 'cursor-default',
        className,
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

export function CardIcon({ icon: Icon, className }) {
  return (
    <div
      className={cn(
        'mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-ink',
        className,
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </div>
  )
}
