import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnvFile } from './parseEnvFile.js'
import { findUtilcarWebRoot } from './findUtilcarWebRoot.js'
import { detectStudioInDirectory, findSanityStudioRoot } from './findSanityStudioRoot.js'
import { loadSanityEnv } from './loadSanityEnv.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_WEB_ROOT = join(__dirname, '../../..')

describe('parseEnvFile', () => {
  it('parsea KEY=valor y comillas', () => {
    const dir = mkdtempSync(join(tmpdir(), 'env-parse-'))
    const path = join(dir, '.env')
    writeFileSync(path, 'SANITY_API_TOKEN=abc123\nVITE_SANITY_PROJECT_ID="proj"\n')
    const env = parseEnvFile(path)
    assert.equal(env.SANITY_API_TOKEN, 'abc123')
    assert.equal(env.VITE_SANITY_PROJECT_ID, 'proj')
    rmSync(dir, { recursive: true })
  })
})

describe('findUtilcarWebRoot', () => {
  it('encuentra utilcar-web en el repositorio', () => {
    const root = findUtilcarWebRoot(REPO_WEB_ROOT)
    assert.equal(root?.replace(/\\/g, '/').endsWith('/utilcar-web'), true)
  })

  it('no confunde utilcar-web/utilcar-studio con utilcar-web', () => {
    const nested = join(REPO_WEB_ROOT, 'utilcar-studio')
    const root = findUtilcarWebRoot(nested)
    assert.equal(root?.replace(/\\/g, '/').endsWith('/utilcar-web'), true)
    assert.notEqual(root, nested)
  })

  it('encuentra utilcar-web desde utilcar-web/utilcar-studio', () => {
    const nested = join(REPO_WEB_ROOT, 'utilcar-studio')
    if (!existsSync(nested)) return
    const root = findUtilcarWebRoot(nested)
    assert.equal(root?.replace(/\\/g, '/').endsWith('/utilcar-web'), true)
  })
})

describe('findSanityStudioRoot', () => {
  it('detecta utilcar-web/utilcar-studio con sanity.cli.cjs', () => {
    const webRoot = findUtilcarWebRoot(REPO_WEB_ROOT)
    const studio = findSanityStudioRoot({ webRoot })
    assert.match(studio.studioRoot, /utilcar-web[\\/]utilcar-studio$/)
    assert.equal(studio.configFilename, 'sanity.cli.cjs')
    assert.equal(studio.source, 'utilcar-web/utilcar-studio')
  })

  it('fallback a cwd si solo existe studio anidado en temp', () => {
    const dir = mkdtempSync(join(tmpdir(), 'studio-fallback-'))
    const web = join(dir, 'utilcar-web')
    const nested = join(web, 'utilcar-studio')
    mkdirSync(nested, { recursive: true })
    mkdirSync(join(web, 'scripts'), { recursive: true })
    writeFileSync(join(web, 'package.json'), JSON.stringify({ name: 'utilcar-web' }))
    writeFileSync(join(web, 'scripts', 'migrate-services-content.mjs'), '// marker')
    writeFileSync(join(nested, 'sanity.config.js'), 'export default {}')

    const studio = findSanityStudioRoot({ webRoot: web })
    assert.equal(studio.studioRoot, nested)
    rmSync(dir, { recursive: true })
  })
})

describe('loadSanityEnv', () => {
  let tempRoot
  let prevEnv

  before(() => {
    prevEnv = { ...process.env }
    tempRoot = mkdtempSync(join(tmpdir(), 'sanity-env-'))
    const web = join(tempRoot, 'utilcar-web')
    const studio = join(web, 'utilcar-studio')
    mkdirSync(join(web, 'scripts'), { recursive: true })
    writeFileSync(join(web, 'scripts', 'migrate-services-content.mjs'), '// marker')
    writeFileSync(join(web, 'package.json'), JSON.stringify({ name: 'utilcar-web' }))
    mkdirSync(studio, { recursive: true })
    writeFileSync(join(web, '.env'), 'VITE_SANITY_PROJECT_ID=from-web-env\n')
    writeFileSync(join(studio, '.env.local'), 'SANITY_API_TOKEN=token-from-studio\n')
  })

  after(() => {
    process.env = prevEnv
    rmSync(tempRoot, { recursive: true })
  })

  it('fusiona archivos en orden y process.env gana', () => {
    process.env = { ...prevEnv }
    for (const key of [
      'SANITY_API_TOKEN',
      'SANITY_AUTH_TOKEN',
      'SANITY_PROJECT_ID',
      'SANITY_STUDIO_PROJECT_ID',
      'VITE_SANITY_PROJECT_ID',
      'SANITY_DATASET',
      'SANITY_STUDIO_DATASET',
      'VITE_SANITY_DATASET',
    ]) {
      delete process.env[key]
    }

    const env = loadSanityEnv({ startDir: join(tempRoot, 'utilcar-web'), requireToken: true })
    assert.equal(env.projectId, 'from-web-env')
    assert.equal(env.token, 'token-from-studio')
  })

  it('lanza error claro si falta token', () => {
    process.env = { ...prevEnv }
    delete process.env.SANITY_API_TOKEN
    writeFileSync(join(tempRoot, 'utilcar-web', 'utilcar-studio', '.env.local'), 'SANITY_PROJECT_ID=only-proj\n')

    assert.throws(
      () => loadSanityEnv({ startDir: join(tempRoot, 'utilcar-web'), requireToken: true }),
      /SANITY_API_TOKEN/,
    )
  })
})

describe('detectStudioInDirectory', () => {
  it('prioriza sanity.cli.cjs sobre sanity.config', () => {
    const dir = mkdtempSync(join(tmpdir(), 'studio-detect-'))
    writeFileSync(join(dir, 'sanity.config.js'), 'export default {}')
    writeFileSync(join(dir, 'sanity.cli.cjs'), 'module.exports = {}')
    const hit = detectStudioInDirectory(dir)
    assert.equal(hit?.configFilename, 'sanity.cli.cjs')
    rmSync(dir, { recursive: true })
  })
})
