import { useEffect } from 'react'

/**
 * Precarga solo la imagen activa y sus vecinas inmediatas (prev/next).
 */
export function useAdjacentImagePreload(index, items, getSrc) {
  useEffect(() => {
    if (index === null || index < 0 || !items?.length) return

    const neighbors = new Set([
      index,
      (index - 1 + items.length) % items.length,
      (index + 1) % items.length,
    ])

    neighbors.forEach((i) => {
      const src = getSrc(items[i])
      if (!src) return
      const img = new Image()
      img.decoding = 'async'
      img.src = src
    })
  }, [index, items, getSrc])
}
