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
  getError: (error: unknown) => {
    let e: unknown = error
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const resp = (error as { response?: { data?: { error?: string } } }).response
      e = resp?.data
      if (resp?.data?.error) {
        e = resp.data.error
      }
    } else if (error instanceof Error) {
      e = error.message
    } else {
      e = 'Unknown error occurred'
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

// --- Shared helpers (previously duplicated across pages) ---

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

export function getRiskColor(score: number): string {
  if (score >= 70) return 'text-risk-danger'
  if (score >= 40) return 'text-risk-caution'
  return 'text-risk-safe'
}

export function getRiskBg(score: number): string {
  if (score >= 70) return 'bg-risk-danger/10'
  if (score >= 40) return 'bg-risk-caution/10'
  return 'bg-risk-safe/10'
}

export function getHighlightBg(tag: string): string {
  switch (tag) {
    case 'risk': return 'bg-risk-danger/15 border-b-2 border-risk-danger'
    case 'obligation': return 'bg-amber-500/15 border-b-2 border-amber-500'
    case 'right': return 'bg-risk-safe/15 border-b-2 border-risk-safe'
    case 'deadline': return 'bg-blue-500/15 border-b-2 border-blue-500'
    default: return 'bg-muted/30 border-b-2 border-muted-foreground/20'
  }
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
