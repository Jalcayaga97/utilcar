import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Card, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { set, unset, useClient, useFormValue } from 'sanity'
import {
  PROJECT_ID_FORMAT_HINT,
  PROJECT_ID_PREFIX_BY_CATEGORY,
  getNextProjectIdForCategory,
  projectIdMatchesCategory,
} from '../../../../src/lib/cms/constants/projectIdCodes.js'

const EXISTING_IDS_QUERY = `*[_type == "workProject" && defined(projectId.current) && !(_id in $ids)].projectId.current`

function normalizeDocumentId(id) {
  return String(id ?? '')
    .replace(/^drafts\./, '')
    .trim()
}

/**
 * projectId gestionado 100% por el sistema: solo lectura en UI.
 * Se genera al elegir categoría y se regenera al cambiarla.
 */
export function ProjectIdSlugInput(props) {
  const { value, onChange } = props
  const client = useClient({ apiVersion: '2024-05-28' })
  const serviceCategory = useFormValue(['serviceCategory'])
  const documentId = useFormValue(['_id'])
  const current = String(value?.current ?? '').trim()

  const [generating, setGenerating] = useState(false)
  const prevCategoryRef = useRef(serviceCategory)
  const isFirstRenderRef = useRef(true)
  const existingIdsRef = useRef(null)

  const fetchExistingIds = useCallback(async () => {
    const normalizedId = normalizeDocumentId(documentId)
    const ids = normalizedId ? [normalizedId, `drafts.${normalizedId}`] : []
    return client.fetch(EXISTING_IDS_QUERY, { ids })
  }, [client, documentId])

  const refreshExistingIds = useCallback(async () => {
    const ids = await fetchExistingIds()
    existingIdsRef.current = ids ?? []
    return existingIdsRef.current
  }, [fetchExistingIds])

  useEffect(() => {
    refreshExistingIds().catch(() => {
      existingIdsRef.current = []
    })
  }, [refreshExistingIds])

  const applyNextId = useCallback(
    (category) => {
      const nextId = getNextProjectIdForCategory(category, existingIdsRef.current ?? [])
      if (!nextId) return false
      onChange(set({ _type: 'slug', current: nextId }))
      return true
    },
    [onChange],
  )

  const assignProjectId = useCallback(
    async (category) => {
      if (applyNextId(category)) {
        refreshExistingIds().catch(() => {})
        return
      }

      setGenerating(true)
      try {
        await refreshExistingIds()
        applyNextId(category)
      } finally {
        setGenerating(false)
      }
    },
    [applyNextId, refreshExistingIds],
  )

  useEffect(() => {
    if (!serviceCategory) {
      if (current) onChange(unset())
      prevCategoryRef.current = serviceCategory
      isFirstRenderRef.current = false
      return
    }

    const categoryChanged =
      !isFirstRenderRef.current && prevCategoryRef.current !== serviceCategory
    const needsInitial = !current
    const prefixMismatch = current && !projectIdMatchesCategory(current, serviceCategory)

    if (categoryChanged || needsInitial || prefixMismatch) {
      if (existingIdsRef.current) {
        applyNextId(serviceCategory)
        refreshExistingIds().catch(() => {})
      } else {
        assignProjectId(serviceCategory)
      }
    }

    prevCategoryRef.current = serviceCategory
    isFirstRenderRef.current = false
  }, [
    applyNextId,
    assignProjectId,
    current,
    onChange,
    refreshExistingIds,
    serviceCategory,
  ])

  const displayValue = generating ? null : current || null

  return (
    <Stack space={3}>
      <Text size={1} muted>
        Código asignado automáticamente según la categoría. Solo lectura — no editable.{' '}
        {PROJECT_ID_FORMAT_HINT}
      </Text>
      <Card padding={3} radius={2} shadow={1} tone="transparent" border>
        <Flex align="center" gap={3}>
          {generating ? (
            <>
              <Spinner muted />
              <Text size={2} muted>
                Generando código…
              </Text>
            </>
          ) : (
            <Box>
              <Text size={1} muted style={{ marginBottom: '0.25rem' }}>
                Código del proyecto
              </Text>
              <Text size={3} weight="semibold">
                {displayValue ?? '—'}
              </Text>
            </Box>
          )}
        </Flex>
      </Card>
    </Stack>
  )
}
