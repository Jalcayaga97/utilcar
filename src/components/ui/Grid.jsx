import { cn } from '@/lib/cn'

const cols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function Grid({ cols: columnCount = 3, gap = 'md', className, children }) {
  const gaps = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }

  return (
    <div className={cn('grid', cols[columnCount], gaps[gap], className)}>{children}</div>
  )
}
