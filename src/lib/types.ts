// Shared types used across the application

export interface Clause {
  id: string
  title: string
  originalText: string
  plainLanguage: string
  riskLevel: 'safe' | 'caution' | 'danger'
  riskTag: 'right' | 'obligation' | 'deadline' | 'risk' | 'information'
  recommendation: string | null
}

export interface AnalysisResult {
  summary: string
  overallRiskScore: number
  clauses: Clause[]
}

export interface DocumentData {
  id: string
  title: string
  type: string
  date: string
  documentText: string
  analysis: AnalysisResult
  riskScore: number
  riskLevel: string
  clauses: number
  status: string
}

export interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
  citation?: string | null
}

export interface DiffItem {
  clause: string
  title: string
  original: string
  revised: string
  changeType: 'modified' | 'added' | 'removed'
}

export interface ExplanationItem {
  clause: string
  title: string
  verdict: 'improved' | 'worsened' | 'neutral'
  explanation: string
}

export interface CompareResult {
  diffs: DiffItem[]
  explanations: ExplanationItem[]
  overallVerdict: 'improved' | 'worsened' | 'neutral'
  overallSummary: string
}
