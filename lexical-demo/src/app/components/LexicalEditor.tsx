'use client'

import {
  $getRoot,
  $getSelection,
  EditorState,
  $createParagraphNode,
} from 'lexical'
import { useState, useCallback, useEffect } from 'react'

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import {
  HeadingNode,
  QuoteNode,
  HeadingTagType,
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from '@lexical/rich-text'
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
} from '@lexical/list'
import { LinkNode, $isLinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { $setBlocksType } from '@lexical/selection'
import { CodeNode, $isCodeNode } from '@lexical/code'

// MUI imports
import {
  Box,
  Paper,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Typography,
  Stack,
  styled,
  useTheme,
} from '@mui/material'

// MUI Icons
import {
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  StrikethroughS as StrikethroughSIcon,
  Code as CodeIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatQuote as FormatQuoteIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
  FormatAlignRight as FormatAlignRightIcon,
  FormatAlignJustify as FormatAlignJustifyIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  CheckBox as CheckListIcon,
  FormatClear as FormatClearIcon,
} from '@mui/icons-material'

// Lexical commands
import {
  $getSelection as $getSelectionLexical,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'

// MUI Styled Components for the Editor
const StyledContentEditable = styled(ContentEditable)(({ theme }) => ({
  minHeight: 400,
  padding: theme.spacing(2, 3),
  fontSize: '1rem',
  outline: 'none',
  position: 'relative',
  fontFamily: theme.typography.fontFamily,
  lineHeight: 1.6,
  color: theme.palette.text.primary,

  '& .editor-paragraph': {
    margin: theme.spacing(0, 0, 1, 0),
    '&:last-child': {
      marginBottom: 0,
    },
  },

  '& .editor-heading-h1': {
    ...theme.typography.h2,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  '& .editor-heading-h2': {
    ...theme.typography.h3,
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary,
  },
  '& .editor-heading-h3': {
    ...theme.typography.h4,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  '& .editor-heading-h4': {
    ...theme.typography.h5,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },

  '& .editor-quote': {
    margin: theme.spacing(2, 0),
    paddingLeft: theme.spacing(2.5),
    borderLeft: `4px solid ${theme.palette.primary.light}`,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    backgroundColor: theme.palette.action.hover,
    borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    padding: theme.spacing(1, 2, 1, 2.5),
  },

  '& .editor-list-ol, & .editor-list-ul': {
    padding: 0,
    margin: theme.spacing(1, 0, 1, 3),
    '& .editor-listitem': {
      margin: theme.spacing(0.5, 0),
    },
  },
  '& .editor-list-ol': {
    listStyleType: 'decimal',
  },
  '& .editor-list-ul': {
    listStyleType: 'disc',
  },

  '& .editor-listitem-checked, & .editor-listitem-unchecked': {
    listStyle: 'none',
    position: 'relative',
    paddingLeft: theme.spacing(3),
    marginLeft: theme.spacing(-3),
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '0.3em',
      width: 16,
      height: 16,
      borderRadius: 3,
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.paper,
      cursor: 'pointer',
    },
  },
  '& .editor-listitem-checked::before': {
    backgroundColor: theme.palette.primary.main,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E\")",
    backgroundSize: '12px',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },

  '& .editor-text-bold': {
    fontWeight: theme.typography.fontWeightBold,
  },
  '& .editor-text-italic': {
    fontStyle: 'italic',
  },
  '& .editor-text-underline': {
    textDecoration: 'underline',
  },
  '& .editor-text-strikethrough': {
    textDecoration: 'line-through',
  },
  '& .editor-text-code': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
    color: theme.palette.secondary.main,
    padding: '2px 6px',
    borderRadius: theme.shape.borderRadius,
    fontFamily: '"Fira Code", "Consolas", monospace',
    fontSize: '0.875em',
  },

  '& .editor-link': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderBottomWidth: 2,
    },
  },
}))

const PlaceholderText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(3),
  color: theme.palette.text.disabled,
  userSelect: 'none',
  pointerEvents: 'none',
  overflow: 'hidden',
}))

// Lexical theme configuration (minimal, just class names)
const lexicalTheme = {
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
  },
  list: {
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
    listitemChecked: 'editor-listitem-checked',
    listitemUnchecked: 'editor-listitem-unchecked',
  },
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    code: 'editor-text-code',
  },
}

// Helper to get block type
function getBlockType(selection: any): string {
  const anchorNode = selection.anchor.getNode()
  const element =
    anchorNode.getKey() === 'root'
      ? anchorNode
      : anchorNode.getTopLevelElementOrThrow()

  if ($isHeadingNode(element)) {
    return element.getTag()
  }
  if ($isQuoteNode(element)) {
    return 'quote'
  }
  if ($isListNode(element)) {
    return element.getListType()
  }
  if ($isCodeNode(element)) {
    return 'code'
  }

  return 'paragraph'
}

// Toolbar Component
function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const theme = useTheme()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [blockType, setBlockType] = useState('paragraph')
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [alignment, setAlignment] = useState<string>('left')

  const updateToolbar = useCallback(() => {
    const selection = $getSelectionLexical()
    if ($isRangeSelection(selection)) {
      const formats: string[] = []
      if (selection.hasFormat('bold')) formats.push('bold')
      if (selection.hasFormat('italic')) formats.push('italic')
      if (selection.hasFormat('underline')) formats.push('underline')
      if (selection.hasFormat('strikethrough')) formats.push('strikethrough')
      if (selection.hasFormat('code')) formats.push('code')
      setSelectedFormats(formats)

      const currentBlockType = getBlockType(selection)
      setBlockType(currentBlockType)
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload)
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  const handleFormatChange = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[]
  ) => {
    const addedFormats = newFormats.filter((f) => !selectedFormats.includes(f))
    const removedFormats = selectedFormats.filter(
      (f) => !newFormats.includes(f)
    )

    addedFormats.forEach((format) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as any)
    })
    removedFormats.forEach((format) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as any)
    })
  }

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelectionLexical()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelectionLexical()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelectionLexical()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const clearFormatting = () => {
    editor.update(() => {
      const selection = $getSelectionLexical()
      if ($isRangeSelection(selection)) {
        ;['bold', 'italic', 'underline', 'strikethrough', 'code'].forEach(
          (format) => {
            if (selection.hasFormat(format as any)) {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as any)
            }
          }
        )
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    if (newAlignment) {
      setAlignment(newAlignment)
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, newAlignment as any)
    }
  }

  const handleBlockTypeChange = (value: string) => {
    if (value === 'paragraph') {
      formatParagraph()
    } else if (value === 'quote') {
      formatQuote()
    } else if (value === 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else if (value === 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else if (value === 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
    } else if (value.startsWith('h')) {
      formatHeading(value as HeadingTagType)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        borderRadius: 0,
        p: 1,
        backgroundColor: theme.palette.grey[50],
        ...(theme.palette.mode === 'dark' && {
          backgroundColor: theme.palette.grey[900],
        }),
      }}
    >
      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
        divider={<Divider orientation='vertical' flexItem />}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        <Stack direction='row' spacing={0.5}>
          <Tooltip title='Undo (Ctrl+Z)'>
            <span>
              <IconButton
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                disabled={!canUndo}
                size='small'
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Redo (Ctrl+Y)'>
            <span>
              <IconButton
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                disabled={!canRedo}
                size='small'
              >
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <FormControl size='small'>
          <Select
            value={blockType}
            onChange={(e) => handleBlockTypeChange(e.target.value)}
            sx={{ minWidth: 140, height: 36 }}
          >
            <MenuItem value='paragraph'>Normal</MenuItem>
            <MenuItem value='h1'>Heading 1</MenuItem>
            <MenuItem value='h2'>Heading 2</MenuItem>
            <MenuItem value='h3'>Heading 3</MenuItem>
            <MenuItem value='h4'>Heading 4</MenuItem>
            <MenuItem value='quote'>Quote</MenuItem>
            <MenuItem value='ul'>Bullet List</MenuItem>
            <MenuItem value='ol'>Number List</MenuItem>
            <MenuItem value='check'>Check List</MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={selectedFormats}
          onChange={handleFormatChange}
          size='small'
        >
          <ToggleButton value='bold'>
            <Tooltip title='Bold (Ctrl+B)'>
              <FormatBoldIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value='italic'>
            <Tooltip title='Italic (Ctrl+I)'>
              <FormatItalicIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value='underline'>
            <Tooltip title='Underline (Ctrl+U)'>
              <FormatUnderlinedIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value='strikethrough'>
            <Tooltip title='Strikethrough'>
              <StrikethroughSIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value='code'>
            <Tooltip title='Inline Code'>
              <CodeIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction='row' spacing={0.5}>
          <Tooltip title='Bullet List'>
            <IconButton
              onClick={() =>
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
              }
              size='small'
            >
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Numbered List'>
            <IconButton
              onClick={() =>
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
              }
              size='small'
            >
              <FormatListNumberedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Check List'>
            <IconButton
              onClick={() =>
                editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
              }
              size='small'
            >
              <CheckListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Quote'>
            <IconButton onClick={formatQuote} size='small'>
              <FormatQuoteIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <ToggleButtonGroup
          value={alignment}
          exclusive
          onChange={handleAlignment}
          size='small'
        >
          <ToggleButton value='left'>
            <Tooltip title='Align Left'>
              <FormatAlignLeftIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value='center'>
            <Tooltip title='Align Center'>
              <FormatAlignCenterIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value='right'>
            <Tooltip title='Align Right'>
              <FormatAlignRightIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value='justify'>
            <Tooltip title='Justify'>
              <FormatAlignJustifyIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title='Clear Formatting'>
          <IconButton onClick={clearFormatting} size='small'>
            <FormatClearIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  )
}

// Main Editor Component
export default function LexicalEditor() {
  const theme = useTheme()

  const initialConfig = {
    namespace: 'MyEditor',
    theme: lexicalTheme,
    onError(error: Error) {
      throw error
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
  }

  function onChange(editorState: EditorState) {
    editorState.read(() => {
      const root = $getRoot()
      const selection = $getSelection()
      console.log('Content:', root.getTextContent())
    })
  }

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <Box>
          <Toolbar />
          <Box sx={{ position: 'relative' }}>
            <RichTextPlugin
              contentEditable={<StyledContentEditable />}
              placeholder={
                <PlaceholderText variant='body1'>
                  Start typing or paste your text here...
                </PlaceholderText>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={onChange} />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <CheckListPlugin />
          </Box>
        </Box>
      </LexicalComposer>
    </Paper>
  )
}
