import { getWebpSrc } from '@/lib/images/webpRegistry'

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
  ...rest
}) {
  const resolvedWebp = webpSrc ?? getWebpSrc(src)

  return (
    <picture className="block h-full w-full">
      {resolvedWebp && <source srcSet={resolvedWebp} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        {...rest}
      />
    </picture>
  )
}
