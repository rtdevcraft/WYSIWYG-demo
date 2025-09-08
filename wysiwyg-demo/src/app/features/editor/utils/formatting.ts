export function countWords(text: string): number {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  return words.length === 1 && words[0] === '' ? 0 : words.length
}

export function countCharacters(text: string): number {
  return text.length
}

export function stripHtml(html: string): string {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function sanitizeHtml(html: string): string {
  return html
}
