import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuickContentStore } from '../../src/stores/quickContentStore'
import ContentLibraryScreen from '../../src/screens/reading/ContentLibraryScreen'
import type { ImportedContent } from '../../src/components/exercises/shared/ContentImportModal'

type Tab = 'library' | 'paste' | 'dosya' | 'recent'

export default function QuickStartRoute() {
  const router     = useRouter()
  const { tab }    = useLocalSearchParams<{ tab: Tab }>()
  const setContent = useQuickContentStore((s) => s.setContent)

  const handleContentSelected = (c: ImportedContent) => {
    setContent(c)
    router.replace('/exercise/quick-reader' as any)
  }

  return (
    <ContentLibraryScreen
      accentColor="#1877F2"
      moduleKey="timed-reading"
      initialTab={tab ?? 'library'}
      onContentSelected={handleContentSelected}
      onBack={() => router.back()}
    />
  )
}
