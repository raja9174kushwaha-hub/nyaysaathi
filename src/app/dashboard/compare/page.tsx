'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRightLeft, Upload, FileText, CheckCircle2, XCircle, MinusCircle, ArrowRight, File as FileIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface DiffItem {
  clause: string
  title: string
  original: string
  revised: string
  changeType: 'modified' | 'added' | 'removed'
}

interface ExplanationItem {
  clause: string
  title: string
  verdict: 'improved' | 'worsened' | 'neutral'
  explanation: string
}

interface CompareResult {
  diffs: DiffItem[]
  explanations: ExplanationItem[]
  overallVerdict: 'improved' | 'worsened' | 'neutral'
  overallSummary: string
}

export default function ComparePage() {
  const [fileA, setFileA] = useState<globalThis.File | null>(null)
  const [fileB, setFileB] = useState<globalThis.File | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileA = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFileA(e.target.files[0]); setError(null) }
  }
  const handleFileB = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFileB(e.target.files[0]); setError(null) }
  }

  const extractText = async (file: globalThis.File): Promise<string> => {
    if (file.name.endsWith('.txt')) {
      return await file.text()
    }
    // For PDFs, use the server extraction
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/extract', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to extract text')
    return data.text
  }

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    setIsComparing(true)
    setError(null)
    setResult(null)

    try {
      const [textA, textB] = await Promise.all([
        extractText(fileA),
        extractText(fileB),
      ])

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textA, textB }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Comparison failed')

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsComparing(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-primary">Compare Documents</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Upload two versions to see what changed — powered by AI.</p>
            </div>
          </div>
          {fileA && fileB && !result && (
            <Button
              onClick={handleCompare}
              disabled={isComparing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {isComparing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Comparing...</>
              ) : (
                <>Run Comparison <ArrowRightLeft className="w-4 h-4" /></>
              )}
            </Button>
          )}
        </div>

        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <UploadBox label="Original (V1)" file={fileA} onChange={handleFileA} />
          <UploadBox label="Revised (V2)" file={fileB} onChange={handleFileB} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-risk-danger bg-risk-danger/10 px-4 py-3 rounded-xl border border-risk-danger/20">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-5"
            >
              {/* Diff View */}
              <Card className="flex-1 overflow-auto">
                <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 z-10">
                  <h3 className="font-semibold font-serif text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Clause-by-Clause Diff
                  </h3>
                  <span className="text-xs text-muted-foreground">{result.diffs.length} changes found</span>
                </div>
                <CardContent className="p-6 md:p-8 text-sm leading-relaxed space-y-8">
                  {result.diffs.map((diff, i) => (
                    <DiffBlock key={i} diff={diff} />
                  ))}
                  {result.diffs.length === 0 && (
                    <p className="text-muted-foreground italic text-center py-8">No significant differences found between the two documents.</p>
                  )}
                </CardContent>
              </Card>

              {/* AI Explanation Sidebar */}
              <Card className="w-full lg:w-[320px] shrink-0 h-fit lg:sticky lg:top-20">
                <div className="bg-primary px-4 py-3 text-primary-foreground rounded-t-xl">
                  <h3 className="font-semibold text-sm">AI Analysis</h3>
                  <p className="text-[10px] text-primary-foreground/70 mt-0.5">What changed and why it matters</p>
                </div>
                <CardContent className="p-4 space-y-5">
                  {result.explanations.map((exp, i) => (
                    <ExplanationCard key={i} item={exp} />
                  ))}
                  <div className="pt-3 border-t border-border">
                    <div className={`flex items-center gap-2 text-sm font-semibold ${
                      result.overallVerdict === 'improved' ? 'text-risk-safe' :
                      result.overallVerdict === 'worsened' ? 'text-risk-danger' :
                      'text-muted-foreground'
                    }`}>
                      {result.overallVerdict === 'improved' ? <CheckCircle2 className="w-4 h-4" /> :
                       result.overallVerdict === 'worsened' ? <XCircle className="w-4 h-4" /> :
                       <MinusCircle className="w-4 h-4" />}
                      Overall: {result.overallSummary}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function UploadBox({ label, file, onChange }: { label: string; file: globalThis.File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <Card className={`border-2 border-dashed transition-all ${file ? 'border-secondary/50 bg-secondary/5' : 'border-border hover:border-primary/30'}`}>
      <CardContent className="p-0">
        <label className="flex flex-col items-center justify-center h-36 cursor-pointer px-4">
          {file ? (
            <div className="flex items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <FileIcon className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-7 h-7 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click to select file (PDF, TXT)</p>
            </>
          )}
          <input type="file" className="hidden" onChange={onChange} accept=".pdf,.txt" />
        </label>
      </CardContent>
    </Card>
  )
}

function DiffBlock({ diff }: { diff: DiffItem }) {
  return (
    <div>
      <h3 className="text-base font-bold font-serif mb-3">Clause {diff.clause} — {diff.title}</h3>
      <div className="space-y-2">
        {diff.changeType !== 'added' && (
          <div className="flex gap-2">
            <span className="shrink-0 w-5 h-5 rounded bg-risk-danger/20 text-risk-danger flex items-center justify-center text-xs font-bold mt-0.5">−</span>
            <p className="text-risk-danger/80 line-through decoration-risk-danger/40">{diff.original}</p>
          </div>
        )}
        {diff.changeType !== 'removed' && (
          <div className="flex gap-2">
            <span className="shrink-0 w-5 h-5 rounded bg-risk-safe/20 text-risk-safe flex items-center justify-center text-xs font-bold mt-0.5">+</span>
            <p className="text-risk-safe">{diff.revised}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ExplanationCard({ item }: { item: ExplanationItem }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {item.verdict === 'improved' ? (
          <CheckCircle2 className="w-4 h-4 text-risk-safe shrink-0" />
        ) : item.verdict === 'worsened' ? (
          <XCircle className="w-4 h-4 text-risk-danger shrink-0" />
        ) : (
          <MinusCircle className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <h4 className={`text-sm font-bold ${
          item.verdict === 'improved' ? 'text-risk-safe' :
          item.verdict === 'worsened' ? 'text-risk-danger' :
          'text-muted-foreground'
        }`}>
          Clause {item.clause} — {item.title}
        </h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-6">{item.explanation}</p>
    </div>
  )
}
