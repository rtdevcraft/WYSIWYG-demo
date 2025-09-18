'use client'

import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Box,
  IconButton,
  Divider,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  Paper,
  Typography,
} from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import LinkIcon from '@mui/icons-material/Link'
import FormatClearIcon from '@mui/icons-material/FormatClear'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'

export default function TiptapEditor() {
  const [headingLevel, setHeadingLevel] = useState<string>('p')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your content here...',
      }),
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      // Handle content updates
      const html = editor.getHTML()
      console.log('Content updated:', html)
    },
    onSelectionUpdate: ({ editor }) => {
      // Update heading level in dropdown when selection changes
      if (editor.isActive('heading', { level: 1 })) {
        setHeadingLevel('h1')
      } else if (editor.isActive('heading', { level: 2 })) {
        setHeadingLevel('h2')
      } else if (editor.isActive('heading', { level: 3 })) {
        setHeadingLevel('h3')
      } else {
        setHeadingLevel('p')
      }
    },
  })

  const handleHeadingChange = useCallback(
    (event: SelectChangeEvent) => {
      if (!editor) return

      const value = event.target.value
      setHeadingLevel(value)

      if (value === 'p') {
        editor.chain().focus().setParagraph().run()
      } else if (value === 'h1') {
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      } else if (value === 'h2') {
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      } else if (value === 'h3') {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      }
    },
    [editor]
  )

  const addLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const clearFormatting = useCallback(() => {
    if (!editor) return
    editor.chain().focus().clearNodes().unsetAllMarks().run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: '2rem auto' }}>
      <Typography variant='h4' component='h1' gutterBottom>
        WYSIWYG Editor (Tiptap)
      </Typography>

      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title='Undo (Ctrl+Z)'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Redo (Ctrl+Y)'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <RedoIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

          <Tooltip title='Text Style'>
            <Select
              size='small'
              value={headingLevel}
              onChange={handleHeadingChange}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value='p'>Normal</MenuItem>
              <MenuItem value='h1'>Heading 1</MenuItem>
              <MenuItem value='h2'>Heading 2</MenuItem>
              <MenuItem value='h3'>Heading 3</MenuItem>
            </Select>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

          <Tooltip title='Bold (Ctrl+B)'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
            >
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Italic (Ctrl+I)'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
            >
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Underline (Ctrl+U)'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              color={editor.isActive('underline') ? 'primary' : 'default'}
            >
              <FormatUnderlinedIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

          <Tooltip title='Bulleted List'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
            >
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Numbered List'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
            >
              <FormatListNumberedIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

          <Tooltip title='Block Quote'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
            >
              <FormatQuoteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Code Block'>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              color={editor.isActive('codeBlock') ? 'primary' : 'default'}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Insert Link'>
            <IconButton
              size='small'
              onClick={addLink}
              color={editor.isActive('link') ? 'primary' : 'default'}
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

          <Tooltip title='Clear All Formatting'>
            <IconButton size='small' onClick={clearFormatting}>
              <FormatClearIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Editor Content */}
        <Box
          sx={{
            minHeight: 400,
            p: 3,
            '& .ProseMirror': {
              minHeight: 400,
              outline: 'none',
              fontSize: '16px',
              lineHeight: 1.6,
              '& p.is-editor-empty:first-of-type::before': {
                color: '#adb5bd',
                content: 'attr(data-placeholder)',
                float: 'left',
                height: 0,
                pointerEvents: 'none',
              },
              '& h1': {
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '1rem 0',
              },
              '& h2': {
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0.75rem 0',
              },
              '& h3': {
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: '0.5rem 0',
              },
              '& ul, & ol': {
                paddingLeft: '1.5rem',
                margin: '0.5rem 0',
              },
              '& blockquote': {
                borderLeft: '3px solid #e0e0e0',
                paddingLeft: '1rem',
                marginLeft: 0,
                color: '#666',
                fontStyle: 'italic',
              },
              '& pre': {
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                padding: '1rem',
                fontFamily: 'monospace',
                overflow: 'auto',
              },
              '& code': {
                backgroundColor: '#f5f5f5',
                padding: '0.125rem 0.25rem',
                borderRadius: '3px',
                fontFamily: 'monospace',
              },
              '& .editor-link': {
                color: '#1976d2',
                textDecoration: 'underline',
                cursor: 'pointer',
                '&:hover': {
                  color: '#1565c0',
                },
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
    </Box>
  )
}
