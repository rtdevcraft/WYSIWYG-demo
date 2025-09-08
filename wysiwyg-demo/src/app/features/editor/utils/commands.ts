import type { FormatType, AlignmentType } from '../types'

export function getFormatCommand(format: FormatType): string {
  const commands: Record<FormatType, string> = {
    bold: 'bold',
    italic: 'italic',
    underline: 'underline',
  }
  return commands[format]
}

export function getAlignmentCommand(align: AlignmentType): string {
  const commands: Record<AlignmentType, string> = {
    left: 'justifyLeft',
    center: 'justifyCenter',
    right: 'justifyRight',
    justify: 'justifyFull',
  }
  return commands[align]
}

export function getHeadingTag(level: number | null): string {
  return level ? `h${level}` : 'p'
}
