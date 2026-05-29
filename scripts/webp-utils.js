import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

export const WEBP_QUALITY = 75
export const INPUT_EXT = new Set(['.jpg', '.jpeg', '.png', '.jfif'])

export async function collectImageFiles(dir, skipDirNames = new Set(), files = []) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return files
    throw error
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (skipDirNames.has(entry.name)) continue
      await collectImageFiles(fullPath, skipDirNames, files)
      continue
    }
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (INPUT_EXT.has(ext)) files.push(fullPath)
  }

  return files
}

export async function convertToWebpBuffer(input) {
  return sharp(input).webp({ quality: WEBP_QUALITY }).toBuffer()
}

export async function convertFileToWebpBuffer(inputPath) {
  return convertToWebpBuffer(inputPath)
}

export async function writeWebpMirror(inputPath, inputRoot, outputRoot) {
  const relative = path.relative(inputRoot, inputPath)
  const relativeWebp = relative.replace(/\.(jpe?g|png|jfif)$/i, '.webp')
  const outputPath = path.join(outputRoot, relativeWebp)

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(inputPath).webp({ quality: WEBP_QUALITY }).toFile(outputPath)

  return { relative, outputPath }
}

export function toWebpPath(filePath) {
  return filePath.replace(/\.(jpe?g|png|jfif)(\?.*)?$/i, '.webp$2')
}

export function rasterExtPattern() {
  return /\.(jpe?g|png|jfif)$/i
}
