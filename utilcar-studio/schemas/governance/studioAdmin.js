/** Vista metadata y secciones avanzadas — solo administradores. */
export function isStudioAdmin(currentUser) {
  if (!currentUser?.roles?.length) return false
  return currentUser.roles.some((role) => role.name === 'administrator')
}

/** Editor de contenido (rol editorial estándar). */
export function isStudioEditor(currentUser) {
  if (!currentUser?.roles?.length) return true
  return currentUser.roles.some((role) =>
    ['administrator', 'editor', 'contributor'].includes(role.name),
  )
}

export function adminOnlyHidden({ currentUser }) {
  return !isStudioAdmin(currentUser)
}

/** Oculta secciones avanzadas de página a editores. */
export function advancedSectionHidden({ currentUser }) {
  return !isStudioAdmin(currentUser)
}
