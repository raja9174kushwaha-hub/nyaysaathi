'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, File as FileIcon, AlertCircle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { detectDocType, getRiskLabel } from '@/lib/utils'

type UploadedFile = globalThis.File

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStage, setAnalysisStage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const stages = [
    'Uploading file...',
    'Extracting text...',
    'Identifying clauses...',
    'Classifying risks...',
    'Generating summary...',
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    setIsAnalyzing(true)
    setAnalysisStage(0)
    setError(null)

    try {
      // Stage 0: Uploading file
      setAnalysisStage(0)

      // Stage 1: Extracting text
      setAnalysisStage(1)

      let documentText = ''

      // For TXT files, read directly on client
      if (file.name.toLowerCase().endsWith('.txt')) {
        documentText = await file.text()
      } else {
        // For PDFs and other files, send to server for extraction
        const formData = new FormData()
        formData.append('file', file)

        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          body: formData,
        })

        const extractData = await extractRes.json()

        if (!extractRes.ok) {
          throw new Error(extractData.error || 'Failed to extract text from file.')
        }

        documentText = extractData.text
      }

      if (!documentText || documentText.trim().length < 20) {
        throw new Error('Could not extract enough text from the file. Please try a different file.')
      }

      // Stage 2: Identifying clauses
      setAnalysisStage(2)

      // Stage 3: Classifying risks (AI call happens here)
      setAnalysisStage(3)

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentText }),
      })

      const analysisData = await analyzeRes.json()

      if (!analyzeRes.ok) {
        throw new Error(analysisData.error || 'AI analysis failed.')
      }

      // Stage 4: Generating summary
      setAnalysisStage(4)

      // Store the analysis result + document text in sessionStorage
      const docId = Date.now().toString()
      const storedDoc = {
        id: docId,
        title: file.name,
        type: detectDocType(file.name),
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        documentText,
        analysis: analysisData,
        riskScore: analysisData.overallRiskScore,
        riskLevel: getRiskLabel(analysisData.overallRiskScore),
        clauses: analysisData.clauses?.length || 0,
        status: 'Analyzed',
      }

      // Save to sessionStorage docs list
      const existingDocs = JSON.parse(sessionStorage.getItem('nyaysaathi_docs') || '[]')
      existingDocs.unshift(storedDoc)
      sessionStorage.setItem('nyaysaathi_docs', JSON.stringify(existingDocs))

      // Also store the current doc separately for quick access
      sessionStorage.setItem(`nyaysaathi_doc_${docId}`, JSON.stringify(storedDoc))

      // Navigate to the document viewer
      router.push(`/dashboard/document/${docId}`)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      console.error('Analysis error:', message)
      setError(message)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload a contract, lease, or policy as a PDF or text file to begin AI analysis.
          </p>
        </div>

        {/* Upload Zone */}
        <Card className={`overflow-hidden border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
            : file
              ? 'border-secondary/50 bg-secondary/5'
              : 'border-border hover:border-primary/30'
        }`}>
          <CardContent className="p-0">
            <label
              className="flex flex-col items-center justify-center w-full h-[280px] md:h-[320px] cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center px-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                      <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-base font-sans text-foreground mb-1">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF or TXT (MAX. 10MB)</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center px-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5">
                      <FileIcon className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-0.5 max-w-sm truncate">{file.name}</h3>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" aria-label="Upload document file" />
            </label>
          </CardContent>
        </Card>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              role="alert"
              className="mt-4 flex items-center gap-2 text-sm text-risk-danger bg-risk-danger/10 px-4 py-3 rounded-xl border border-risk-danger/20"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex flex-col items-center gap-5"
            >
              {isAnalyzing ? (
                <div className="w-full max-w-md space-y-4">
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={((analysisStage + 1) / stages.length) * 100} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div
                      className="h-full bg-secondary rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((analysisStage + 1) / stages.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  {/* Stage steps */}
                  <div className="space-y-2" aria-live="polite" aria-atomic="true" role="status">
                    {stages.map((stage, i) => (
                      <div key={i} className={`flex items-center gap-2 text-sm transition-colors ${
                        i < analysisStage ? 'text-risk-safe' : i === analysisStage ? 'text-primary font-medium' : 'text-muted-foreground/50'
                      }`}>
                        {i < analysisStage ? (
                          <CheckCircle2 className="w-4 h-4 text-risk-safe shrink-0" />
                        ) : i === analysisStage ? (
                          <span className="flex h-4 w-4 items-center justify-center shrink-0">
                            <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-secondary opacity-75" />
                            <span className="relative rounded-full h-2 w-2 bg-secondary" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                        )}
                        {stage}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="lg" onClick={() => { setFile(null); setError(null) }}>
                    Remove
                  </Button>
                  <Button size="lg" onClick={handleAnalyze} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 gap-2">
                    Start Analysis
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Documents are processed by AI and not stored permanently.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
