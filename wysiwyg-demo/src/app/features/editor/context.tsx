import { createContext, useContext, type ReactNode } from 'react'
import type { EditorContextType } from './types'

const EditorContext = createContext<EditorContextType | null>(null)

export function EditorProvider({
  children,
  value,
}: {
  children: ReactNode
  value: EditorContextType
}) {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  )
}

export function useEditorContext(): EditorContextType {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider')
  }
  return context
}

export { EditorContext }
