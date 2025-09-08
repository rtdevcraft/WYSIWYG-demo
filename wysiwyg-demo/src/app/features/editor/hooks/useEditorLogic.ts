import { useState, useRef, useEffect, type MutableRefObject } from 'react'
import type { EditorContextType, FormatType, AlignmentType } from '../types'
import { getAlignmentCommand, getFormatCommand } from '../utils/commands'
import { countWords, countCharacters } from '../utils/formatting'

export function useEditorLogic(
  editorRef: MutableRefObject<HTMLDivElement | null>
): EditorContextType {
  const [content, setContent] = useState<string>('')
  const [selectedFormats, setSelectedFormats] = useState<Set<FormatType>>(
    new Set()
  )
  const [alignment, setAlignment] = useState<AlignmentType>('left')
  const [wordCount, setWordCount] = useState<number>(0)
  const [charCount, setCharCount] = useState<number>(0)
  const [undoStack, setUndoStack] = useState<string[]>([''])
  const [currentUndoIndex, setCurrentUndoIndex] = useState<number>(0)
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false)
  const savedSelection = useRef<Range | null>(null)

  // Update word and character count
  useEffect(() => {
    const text = editorRef.current?.innerText || ''
    setWordCount(countWords(text))
    setCharCount(countCharacters(text))
  }, [content, editorRef])

  // Save and restore selection
  const saveSelection = (): void => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0)
    }
  }

  const restoreSelection = (): void => {
    if (savedSelection.current && editorRef.current) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedSelection.current)
      }
    }
  }

  // Execute command
  const executeCommand = (
    command: string,
    value: string | null = null
  ): void => {
    editorRef.current?.focus()
    document.execCommand(command, false, value || undefined)
    handleContentChange()
    updateFormatState()
  }

  // Toggle format
  const toggleFormat = (format: FormatType): void => {
    const command = getFormatCommand(format)
    executeCommand(command)

    const newFormats = new Set(selectedFormats)
    if (newFormats.has(format)) {
      newFormats.delete(format)
    } else {
      newFormats.add(format)
    }
    setSelectedFormats(newFormats)
  }

  // Handle alignment
  const handleAlignment = (align: AlignmentType): void => {
    const command = getAlignmentCommand(align)
    executeCommand(command)
    setAlignment(align)
  }

  // Update format state
  const updateFormatState = (): void => {
    const formats = new Set<FormatType>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    setSelectedFormats(formats)

    if (document.queryCommandState('justifyCenter')) setAlignment('center')
    else if (document.queryCommandState('justifyRight')) setAlignment('right')
    else if (document.queryCommandState('justifyFull')) setAlignment('justify')
    else setAlignment('left')
  }

  // Handle content change
  const handleContentChange = (): void => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)

      const newStack = [...undoStack.slice(0, currentUndoIndex + 1), newContent]
      setUndoStack(newStack)
      setCurrentUndoIndex(newStack.length - 1)
    }
  }

  // Undo/Redo functions
  const handleUndo = (): void => {
    if (currentUndoIndex > 0) {
      const newIndex = currentUndoIndex - 1
      const previousContent = undoStack[newIndex]

      if (editorRef.current) {
        editorRef.current.innerHTML = previousContent
        setContent(previousContent)
        setCurrentUndoIndex(newIndex)
      }
    }
  }

  const handleRedo = (): void => {
    if (currentUndoIndex < undoStack.length - 1) {
      const newIndex = currentUndoIndex + 1
      const nextContent = undoStack[newIndex]

      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent
        setContent(nextContent)
        setCurrentUndoIndex(newIndex)
      }
    }
  }

  // Insert link
  const handleInsertLink = (): void => {
    saveSelection()
    setShowLinkDialog(true)
  }

  const confirmLink = (url: string): void => {
    restoreSelection()
    if (url) {
      executeCommand('createLink', url)
    }
    setShowLinkDialog(false)
  }

  // Clear formatting
  const clearFormatting = (): void => {
    executeCommand('removeFormat')
    executeCommand('formatBlock', '<p>')
    setSelectedFormats(new Set())
    setAlignment('left')
  }

  return {
    // State
    content,
    selectedFormats,
    alignment,
    wordCount,
    charCount,
    showLinkDialog,
    canUndo: currentUndoIndex > 0,
    canRedo: currentUndoIndex < undoStack.length - 1,
    // Actions
    executeCommand,
    toggleFormat,
    handleAlignment,
    updateFormatState,
    handleContentChange,
    handleUndo,
    handleRedo,
    handleInsertLink,
    confirmLink,
    clearFormatting,
    setShowLinkDialog,
  }
}
