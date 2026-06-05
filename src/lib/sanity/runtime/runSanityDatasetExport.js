import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { findSanityStudioRoot } from './findSanityStudioRoot.js'

/**
 * Sandbox CJS: Sanity CLI hace require('sanity.cli.js') y falla con "type":"module" en el Studio.
 * Generamos un directorio temporal sin type:module y sanity.cli.js en CommonJS puro.
 */
function createCliSandbox(projectId, dataset, studioModulesDir) {
  const dir = mkdtempSync(join(tmpdir(), 'utilcar-sanity-export-'))
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'utilcar-sanity-export-sandbox' }))
  writeFileSync(
    join(dir, 'sanity.cli.js'),
    `module.exports = {
  api: {
    projectId: ${JSON.stringify(projectId)},
    dataset: ${JSON.stringify(dataset)},
  },
}`,
  )
  try {
    symlinkSync(studioModulesDir, join(dir, 'node_modules'), 'junction')
  } catch {
    symlinkSync(studioModulesDir, join(dir, 'node_modules'), 'dir')
  }
  return dir
}

/**
 * Ejecuta `sanity dataset export` usando el binario del Studio detectado.
 *
 * @param {{ dataset: string, destination: string, startDir?: string, webRoot?: string, env?: { applyToProcessEnv?: () => void, projectId?: string, dataset?: string } }} params
 * @returns {Promise<string>}
 */
export function runSanityDatasetExport({ dataset, destination, startDir, webRoot, env }) {
  env?.applyToProcessEnv?.()

  const projectId =
    env?.projectId ||
    process.env.SANITY_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID ||
    process.env.VITE_SANITY_PROJECT_ID

  if (!projectId?.trim()) {
    throw new Error('runSanityDatasetExport: falta projectId (use loadSanityEnv).')
  }

  const studio = findSanityStudioRoot({ startDir, webRoot })
  mkdirSync(dirname(destination), { recursive: true })

  /** Sandbox CJS: CLI lee sanity.cli.js con require(); el cwd debe tener node_modules/sanity. */
  const studioModules = join(studio.studioRoot, 'node_modules')
  const localSanityBin = join(studioModules, 'sanity', 'bin', 'sanity')

  if (!existsSync(localSanityBin)) {
    throw new Error(
      `No se encontró sanity en ${studio.studioRoot}. Ejecute npm install en utilcar-studio.`,
    )
  }

  const sandboxDir = createCliSandbox(projectId, dataset, studioModules)

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [localSanityBin, 'dataset', 'export', dataset, destination, '--overwrite'], {
      cwd: sandboxDir,
      stdio: 'inherit',
      env: { ...process.env },
    })

    const cleanup = () => {
      try {
        rmSync(sandboxDir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }

    child.on('error', (err) => {
      cleanup()
      reject(err)
    })
    child.on('exit', (code) => {
      cleanup()
      if (code === 0) resolve(destination)
      else {
        reject(
          new Error(
            `sanity dataset export falló (código ${code}). Studio: ${studio.studioRoot}`,
          ),
        )
      }
    })
  })
}
