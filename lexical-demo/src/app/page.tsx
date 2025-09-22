'use client'

import dynamic from 'next/dynamic'
import { Container, Typography, Box } from '@mui/material'

const LexicalEditor = dynamic(() => import('./components/LexicalEditor'), {
  ssr: false,
})

export default function Home() {
  return (
    <Container maxWidth='lg'>
      <Box sx={{ py: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom align='center'>
          Lexical Editor
        </Typography>
        <Typography
          variant='subtitle1'
          gutterBottom
          align='center'
          color='text.secondary'
        >
          A modern WYSIWYG editor built with Lexical
        </Typography>
        <Box sx={{ mt: 4 }}>
          <LexicalEditor />
        </Box>
      </Box>
    </Container>
  )
}
