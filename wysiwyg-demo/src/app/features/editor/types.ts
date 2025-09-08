import type { SvgIconComponent } from '@mui/icons-material'
import type { ReactNode, MutableRefObject } from 'react'

export type FormatType = 'bold' | 'italic' | 'underline'
export type AlignmentType = 'left' | 'center' | 'right' | 'justify'
export type HeadingLevel = 1 | 2 | 3

export interface EditorState {
  content: string
  selectedFormats: Set<FormatType>
  alignment: AlignmentType
  wordCount: number
  charCount: number
  showLinkDialog: boolean
  canUndo: boolean
  canRedo: boolean
}

export interface EditorActions {
  executeCommand: (command: string, value?: string | null) => void
  toggleFormat: (format: FormatType) => void
  handleAlignment: (align: AlignmentType) => void
  updateFormatState: () => void
  handleContentChange: () => void
  handleUndo: () => void
  handleRedo: () => void
  handleInsertLink: () => void
  confirmLink: (url: string) => void
  clearFormatting: () => void
  setShowLinkDialog: (show: boolean) => void
}

export type EditorContextType = EditorState & EditorActions

export interface EditorProps {
  initialContent?: string
  placeholder?: string
  onChange?: (content: string) => void
  className?: string
  minHeight?: number | string
}

export interface ToolbarButtonProps {
  icon: SvgIconComponent
  label: string
  onClick: () => void
  isActive?: boolean
  shortcut?: string
  disabled?: boolean
}

export interface LinkDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (url: string) => void
}

export interface EditorContentProps {
  editorRef: MutableRefObject<HTMLDivElement | null>
  onContentChange: () => void
  onSelectionChange: () => void
  placeholder?: string
  minHeight?: number | string
}
