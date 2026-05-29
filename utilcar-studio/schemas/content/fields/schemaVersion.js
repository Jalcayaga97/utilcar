/** Debe coincidir con SCHEMA_VERSION en utilcar-web/src/lib/cms/validate.js */
export const SCHEMA_VERSION_VALUE = 1

export const schemaVersionField = {
  name: 'schemaVersion',
  title: 'Versión de schema',
  type: 'number',
  hidden: true,
  initialValue: SCHEMA_VERSION_VALUE,
  readOnly: true,
  validation: (Rule) => Rule.required().integer().min(1).max(1),
}
