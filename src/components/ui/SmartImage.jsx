import { getWebpSrc } from '@/lib/images/webpRegistry'
import { cn } from '@/lib/cn'

/**
 * Imagen con fallback nativo y WebP opcional vía <picture>.
 * Si webpSrc no se pasa, intenta resolverlo desde el registro build-time.
 */
export function SmartImage({
  src,
  webpSrc,
  alt = '',
  className,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  srcSet,
  sizes,
  width,
  height,
  ...rest
}) {
  const resolvedWebp = webpSrc ?? getWebpSrc(src)

  return (
    <picture className="flex h-full w-full items-center justify-center">
      {resolvedWebp && <source srcSet={resolvedWebp} type="image/webp" />}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        alt={alt}
        className={cn('h-full w-full max-h-full max-w-full object-contain object-center', className)}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        {...rest}
      />
    </picture>
  )
}
