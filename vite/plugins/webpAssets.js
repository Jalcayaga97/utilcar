import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectImageFiles,
  convertToWebpBuffer,
  rasterExtPattern,
  toWebpPath,
  writeWebpMirror,
} from '../../scripts/webp-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const PUBLIC_WEBP_DIR = path.join(PUBLIC_DIR, 'webp')
const ASSETS_IMAGES_DIR = path.join(ROOT, 'src', 'assets', 'images')
const DEV_CACHE_DIR = path.join(ROOT, '.cache', 'webp')

const RASTER_EXT = ['.jpg', '.jpeg', '.png', '.jfif', '.JPG', '.JPEG', '.PNG', '.JFIF']

function isRasterAsset(fileName) {
  return fileName.startsWith('assets/') && rasterExtPattern().test(fileName)
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

function resolveSourceFromDevWebpUrl(urlPath) {
  const decoded = decodePathname(urlPath.split('?')[0])
  if (!decoded.endsWith('.webp')) return null

  const candidates = []

  const assetsMatch = decoded.match(/\/assets\/images\/(.+)\.webp$/i)
  if (assetsMatch) {
    const rel = assetsMatch[1]
    for (const ext of RASTER_EXT) {
      candidates.push(path.join(ASSETS_IMAGES_DIR, `${rel}${ext}`))
    }
  }

  if (decoded.startsWith('/webp/')) {
    const rel = decoded.slice('/webp/'.length).replace(/\.webp$/i, '')
    for (const ext of RASTER_EXT) {
      candidates.push(path.join(PUBLIC_DIR, `${rel}${ext}`))
    }
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  return null
}

async function ensurePublicWebp() {
  await fsPromises.mkdir(PUBLIC_WEBP_DIR, { recursive: true })
  const files = await collectImageFiles(PUBLIC_DIR, new Set(['webp']))
  for (const file of files) {
    await writeWebpMirror(file, PUBLIC_DIR, PUBLIC_WEBP_DIR)
  }
}

async function serveDevWebp(req, res, next) {
  const urlPath = req.url?.split('?')[0]
  if (!urlPath?.endsWith('.webp')) return next()

  const sourcePath = resolveSourceFromDevWebpUrl(urlPath)
  if (!sourcePath) return next()

  try {
    const cacheKey = path.relative(ROOT, sourcePath).replace(/\\/g, '/')
    const cachePath = path.join(DEV_CACHE_DIR, `${cacheKey}.webp`)

    await fsPromises.mkdir(path.dirname(cachePath), { recursive: true })

    if (!fs.existsSync(cachePath)) {
      const buffer = await convertToWebpBuffer(sourcePath)
      await fsPromises.writeFile(cachePath, buffer)
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'image/webp')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    fs.createReadStream(cachePath).pipe(res)
  } catch {
    next()
  }
}

/**
 * Emite .webp gemelo por cada asset raster en build y sirve WebP bajo demanda en dev.
 */
export function webpAssetsPlugin() {
  return {
    name: 'utilcar-webp-assets',

    async buildStart() {
      await ensurePublicWebp()
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        serveDevWebp(req, res, next)
      })
    },

    async generateBundle(_options, bundle) {
      const tasks = []

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !isRasterAsset(fileName)) continue

        const source = asset.source
        if (!source) continue

        const webpFileName = toWebpPath(fileName)
        const input = Buffer.isBuffer(source) ? source : Buffer.from(source)

        tasks.push(
          convertToWebpBuffer(input).then((webpBuffer) => {
            this.emitFile({
              type: 'asset',
              fileName: webpFileName,
              source: webpBuffer,
            })
          }),
        )
      }

      await Promise.all(tasks)
    },
  }
}
