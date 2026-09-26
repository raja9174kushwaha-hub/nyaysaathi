// Shared domain types for document understanding and the existing UI.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'REVIEW_REQUIRED'
export type Confidence = 'high' | 'medium' | 'low'

export interface Citation {
  id: string
  document: string
  page: string
  section: string
  excerpt: string
}

export interface LegalClause {
  id: string
  clauseType: string
  title: string
  originalText: string
  plainLanguage: string
  userObligation: string
  otherPartyObligation: string
  potentialConcern: string
  source: string
  confidence: Confidence
  recommendedQuestion: string
}

export interface RiskFinding {
  id: string
  category: string
  severity: RiskLevel
  title: string
  evidence: string
  explanation: string
  potentialImpact: string
  suggestedQuestion: string
}

export interface LegalDocumentAnalysis {
  summary: string
  overallRiskScore: number
  overallRiskLevel: RiskLevel
  keyDates: string[]
  financialObligations: string[]
  terminationConditions: string[]
  clauses: LegalClause[]
  risks: RiskFinding[]
  actionItems: string[]
  lawyerQuestions: string[]
  citations: Citation[]
  evidenceStatus: string
}

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
  risks?: RiskFinding[]
  actionItems?: string[]
  lawyerQuestions?: string[]
  citations?: Citation[]
  evidenceStatus?: string
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
