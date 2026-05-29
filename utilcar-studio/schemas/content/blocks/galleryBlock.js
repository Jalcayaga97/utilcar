import { portfolioBlock } from './portfolioBlock.js'

/** Alias legacy — documentos antiguos con _type galleryBlock. */
export const galleryBlock = {
  ...portfolioBlock,
  name: 'galleryBlock',
  title: 'Portfolio (legacy)',
}
