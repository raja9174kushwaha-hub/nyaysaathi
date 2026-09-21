import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resizeTextarea(this: HTMLTextAreaElement) {
  this.style.height = 'auto'
  this.style.height = `${this.scrollHeight}px`
}

export const errorUtils = {
  getError: (error: any) => {
    let e = error
    if (error.response) {
      e = error.response.data
      if (error.response.data && error.response.data.error) {
        e = error.response.data.error
      }
    } else if (error.message) {
      e = error.message
    } else {
      e = 'Unknown error occured'
    }
    console.error(e)
  },
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result?.toString() || '')
    reader.onerror = (error) => reject(error)
  })
}

export const smoothScrollTo = (id: string) => {
  const element = document.getElementById(id) as HTMLElement
  element?.scrollIntoView({
    block: 'start',
  })
}

export const convertToHtml = (text: string) => {
  if (!text) {
    return ''
  }

  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]/g, '<span class="placeholder">$1</span>')
    .replace(/\n/g, '<br/>')
}

export const convertFromHtml = (html: string | undefined) => {
  if (!html) {
    return ''
  }

  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<span class="placeholder">(.*?)<\/span>/g, '[$1]')
    .replace(/<br\/>/g, '\n')
}

export const fileTypes = ['application/pdf', 'text/plain']

export function detectDocType(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.includes('lease') || lower.includes('rent')) return 'Lease'
  if (lower.includes('nda') || lower.includes('disclosure')) return 'NDA'
  if (lower.includes('contract') || lower.includes('agreement')) return 'Contract'
  if (lower.includes('policy') || lower.includes('terms') || lower.includes('tos')) return 'ToS'
  return 'Document'
}

export function getRiskLabel(score: number): string {
  if (score >= 70) return 'High Risk'
  if (score >= 40) return 'Caution'
  return 'Safe'
}
