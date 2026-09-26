import type { RiskLevel, RiskFinding, LegalClause, LegalDocumentAnalysis } from '@/lib/types'

const SECTION_SEPARATOR_PATTERN = /\n\s*\n+/g
const CLAUSE_KEYWORDS: Record<string, RegExp> = {
  Payment: /payment|fees?|invoice|amount|remittance|consideration|subscription/i,
  Termination: /termination|terminate|expires?|renewal|cancel(?:lation)?/i,
  Liability: /liability|indemnif|damages|losses?|limitation of liability/i,
  Confidentiality: /confidential|non[- ]disclosure|protection of information/i,
  GoverningLaw: /governing law|jurisdiction|arbitration|applicable law/i,
  Notice: /notice period|written notice|notice/i,
  Compliance: /compliance|regulatory|data protection|gdpr|privacy/i,
  IP: /intellectual property|ip rights|copyright|patent|trademark/i,
}

const RISK_PATTERNS: Array<{ pattern: RegExp; title: string; category: string; severity: RiskLevel; explanation: string; impact: string; suggestion: string }> = [
  {
    pattern: /automatic(?:ally)? renew|renew(s|al)? automatically|renewal.*unless/i,
    title: 'Automatic renewal',
    category: 'Renewal',
    severity: 'HIGH',
    explanation: 'The agreement appears to renew automatically unless the user gives timely notice.',
    impact: 'The user may remain bound for another term if they miss a notice deadline.',
    suggestion: 'Ask: What happens if I miss the notice window before renewal?',
  },
  {
    pattern: /termination.*without notice|terminate.*without notice|immediate termination/i,
    title: 'Termination without notice',
    category: 'Termination',
    severity: 'HIGH',
    explanation: 'The document may allow a party to end the relationship immediately in certain situations.',
    impact: 'This could result in abrupt loss of service or legal rights with limited recourse.',
    suggestion: 'Ask: Under what circumstances can the agreement be terminated immediately?',
  },
  {
    pattern: /liability.*unlimited|cap.*liability|limitation of liability|indemnif/i,
    title: 'Liability or indemnity exposure',
    category: 'Liability',
    severity: 'HIGH',
    explanation: 'The agreement may shift a substantial amount of risk to the user or limit remedies.',
    impact: 'The user may be responsible for losses, damages, or legal costs beyond a normal commercial expectation.',
    suggestion: 'Ask: What are the financial and legal exposures if the agreement is breached?',
  },
  {
    pattern: /late fee|penalty|interest.*delay|breach.*penalty|liquidated damages/i,
    title: 'Penalty or fee trigger',
    category: 'Fees',
    severity: 'MEDIUM',
    explanation: 'The clause appears to create an additional financial consequence for delay or breach.',
    impact: 'The user may owe extra amounts or face enforcement action if terms are not met.',
    suggestion: 'Ask: What are the exact conditions that trigger a fee or penalty?',
  },
  {
    pattern: /arbitration|governing law|jurisdiction/i,
    title: 'Dispute resolution / governing law',
    category: 'Dispute Resolution',
    severity: 'MEDIUM',
    explanation: 'The agreement specifies dispute mechanisms and legal venue, which may affect enforcement and costs.',
    impact: 'The user may need to resolve disputes in a specific forum or under a chosen legal system.',
    suggestion: 'Ask: What is the practical effect of the arbitration or governing law clause for me?',
  },
]

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function splitSections(text: string): string[] {
  return text
    .split(SECTION_SEPARATOR_PATTERN)
    .map((section) => section.trim())
    .filter(Boolean)
}

function toSectionLabel(section: string): string {
  const match = section.match(/^\s*(?:[0-9]+[.)-]?\s*)?(?:[A-Z][A-Za-z0-9 &/-]+[:])\s*(.*)$/)
  return match ? match[1].trim() : section.slice(0, 80)
}

function classifyClauseType(section: string): string {
  const lower = section.toLowerCase()
  for (const [label, regex] of Object.entries(CLAUSE_KEYWORDS)) {
    if (regex.test(lower)) return label
  }
  return 'General legal provision'
}

function makeClause(section: string, index: number): LegalClause {
  const excerpt = normalizeWhitespace(section)
  const clauseType = classifyClauseType(excerpt)
  const lower = excerpt.toLowerCase()

  let userObligation = 'User obligations are not clearly stated in the excerpt.'
  if (/must|shall|required|obliged|undertakes|agrees/i.test(lower)) {
    userObligation = 'The party receiving this document appears to have a duty to satisfy the stated obligation.'
  }

  let otherPartyObligation = 'The counterparty obligations are not clearly stated in the excerpt.'
  if (/counterparty|provider|supplier|company|vendor|service provider/i.test(lower)) {
    otherPartyObligation = 'The other party may have corresponding duties defined elsewhere in the agreement.'
  }

  const concern = /liability|penalty|automatic|termination|indemnif|renewal|arbitration|jurisdiction/i.test(lower)
    ? 'Potential concern: this clause may materially affect rights, costs, or obligations.'
    : 'This clause appears standard and warrants confirmation with a lawyer if the business impact is significant.'

  return {
    id: `C${index + 1}`,
    clauseType,
    title: clauseType,
    originalText: excerpt,
    plainLanguage: 'This provision appears to set out a key legal duty or right that should be reviewed in context.',
    userObligation,
    otherPartyObligation,
    potentialConcern: concern,
    source: toSectionLabel(excerpt),
    confidence: 'medium',
    recommendedQuestion: `What is the practical impact of this ${clauseType.toLowerCase()} obligation for me?`,
  }
}

export function analyzeLegalDocument(text: string): LegalDocumentAnalysis {
  const safeText = normalizeWhitespace(text)
  const sections = splitSections(safeText)
  const clauses: LegalClause[] = sections.slice(0, 10).map(makeClause)

  const risks: RiskFinding[] = []
  const matchedPatterns = new Set<string>()

  for (const match of RISK_PATTERNS) {
    if (!match.pattern.test(safeText)) continue
    matchedPatterns.add(match.title)
    risks.push({
      id: `R${risks.length + 1}`,
      category: match.category,
      severity: match.severity,
      title: match.title,
      evidence: match.title,
      explanation: match.explanation,
      potentialImpact: match.impact,
      suggestedQuestion: match.suggestion,
    })
  }

  const summaryParts: string[] = []
  if (clauses.length > 0) {
    summaryParts.push(`This document appears to contain ${clauses.length} material sections that should be reviewed.`)
  }
  if (risks.length > 0) {
    summaryParts.push(`The main areas of attention are ${risks.map((risk) => risk.title.toLowerCase()).join(', ')}.`)
  } else {
    summaryParts.push('No immediately obvious high-risk patterns were detected in the supplied text.')
  }
  summaryParts.push('Any consequential decision should be checked against the specific document language and a qualified lawyer.')

  const riskScore = Math.min(95, 25 + clauses.length * 6 + risks.length * 14)

  return {
    summary: summaryParts.join(' '),
    overallRiskScore: Math.round(riskScore),
    overallRiskLevel: risks.length === 0 ? 'LOW' : risks.some((risk) => risk.severity === 'HIGH') ? 'HIGH' : 'MEDIUM',
    keyDates: Array.from(new Set(safeText.match(/(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b)/gi) ?? [])).slice(0, 5),
    financialObligations: safeText.match(/(?:\$|₹|USD|INR|fees?|payment|amount|cost|consideration)\s*(?:[0-9,]+(?:\.[0-9]+)?)/gi)?.slice(0, 5) ?? [],
    terminationConditions: safeText.match(/(?:termination|cancel(?:lation)?|expire|upon breach|for convenience)[^\n]{0,120}/gi)?.slice(0, 5) ?? [],
    clauses,
    risks,
    actionItems: [
      'Review the most material obligations and deadlines in the document.',
      'Confirm whether the document allows a party to terminate or renew automatically.',
      'Check the cost, fee, and liability provisions before relying on the agreement.',
    ],
    lawyerQuestions: [
      'What are the practical consequences of the termination and renewal clauses?',
      'Are there any obligations or penalties that I should negotiate before signing?',
      'What should I ask for before agreeing to the liability or indemnity terms?',
    ],
    citations: clauses.slice(0, 3).map((clause, index) => ({
      id: `C${index + 1}`,
      document: 'uploaded-document',
      section: clause.source,
      excerpt: clause.originalText.slice(0, 140),
      page: 'N/A',
    })),
    evidenceStatus: 'This summary is based on the supplied document text and deterministic clause detection only.',
  }
}
