import { Box, Typography } from '@mui/material'
import type { EditorContentProps } from '../types'

export function EditorContent({
  editorRef,
  onContentChange,
  onSelectionChange,
  placeholder = 'Start typing your content here...',
  minHeight = 400,
}: EditorContentProps) {
  return (
    <>
      <Box
        ref={editorRef}
        contentEditable
        role='textbox'
        aria-label='Main editor content'
        aria-multiline='true'
        aria-describedby='editor-instructions'
        onInput={onContentChange}
        onMouseUp={onSelectionChange}
        onKeyUp={onSelectionChange}
        sx={{
          minHeight,
          p: 3,
          outline: 'none',
          fontSize: '16px',
          lineHeight: 1.6,
          '&:focus': {
            boxShadow: (theme) =>
              `inset 0 0 0 2px ${theme.palette.primary.main}`,
          },
          '& p': {
            margin: 0,
            minHeight: '1em',
          },
          '& p:first-of-type:empty::before': {
            content: `"${placeholder}"`,
            color: 'text.disabled',
            pointerEvents: 'none',
            position: 'absolute',
          },
          '& blockquote': {
            borderLeft: 4,
            borderColor: 'divider',
            pl: 2,
            ml: 0,
            color: 'text.secondary',
            fontStyle: 'italic',
          },
          '& pre': {
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            fontFamily: 'monospace',
            overflow: 'auto',
          },
          '& h1': {
            fontSize: '2rem',
            fontWeight: 'bold',
            my: 2,
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            my: 1.5,
          },
          '& h3': {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            my: 1,
          },
          '& ul, & ol': {
            pl: 4,
            my: 1,
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'underline',
            '&:hover': {
              color: 'primary.dark',
            },
          },
        }}
        suppressContentEditableWarning={true}
      >
        <p></p>
      </Box>

      <Typography
        id='editor-instructions'
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        aria-live='polite'
      >
        Rich text editor. Use keyboard shortcuts: Control plus B for bold,
        Control plus I for italic, Control plus U for underline, Control plus Z
        for undo, Control plus Y for redo. Tab to navigate toolbar buttons.
      </Typography>
    </>
  )
}
