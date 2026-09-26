import { z } from 'zod'

export const citationSchema = z.object({
  id: z.string().min(1).max(40),
  document: z.string().min(1).max(200),
  page: z.string().min(1).max(30),
  section: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(1000),
})

export const clauseSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(1).max(200),
  originalText: z.string().min(1).max(10000),
  plainLanguage: z.string().min(1).max(3000),
  riskLevel: z.enum(['safe', 'caution', 'danger']),
  riskTag: z.enum(['right', 'obligation', 'deadline', 'risk', 'information']),
  recommendation: z.string().max(2000).nullable(),
})

export const analysisResultSchema = z.object({
  summary: z.string().min(1).max(10000),
  overallRiskScore: z.number().int().min(0).max(100),
  clauses: z.array(clauseSchema).max(200),
  citations: z.array(citationSchema).max(200).optional(),
  evidenceStatus: z.string().max(1000).optional(),
})

export const chatResultSchema = z.object({
  answer: z.string().min(1).max(10000),
  citation: z.string().max(500).nullable().optional(),
  evidenceStatus: z.enum(['supported', 'insufficient']).default('supported'),
})

export const compareResultSchema = z.object({
  diffs: z.array(z.object({
    clause: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    original: z.string().max(10000),
    revised: z.string().max(10000),
    changeType: z.enum(['modified', 'added', 'removed']),
  })).max(200),
  explanations: z.array(z.object({
    clause: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    verdict: z.enum(['improved', 'worsened', 'neutral']),
    explanation: z.string().min(1).max(3000),
  })).max(200),
  overallVerdict: z.enum(['improved', 'worsened', 'neutral']),
  overallSummary: z.string().min(1).max(5000),
})

export function parseModelJson<T>(raw: string, schema: z.ZodType<T>): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  let value: unknown
  try {
    value = JSON.parse(cleaned)
  } catch {
    throw new Error('The AI returned an invalid structured response.')
  }
  const result = schema.safeParse(value)
  if (!result.success) throw new Error('The AI response failed safety validation.')
  return result.data
}

export function hasPromptInjection(text: string): boolean {
  return /ignore\s+(?:all|any|previous|prior)\s+instructions|reveal\s+(?:the\s+)?system prompt|developer message|follow these instructions instead/i.test(text)
}
