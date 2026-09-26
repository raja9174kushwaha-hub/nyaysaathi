'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShieldAlert, ShieldCheck, ShieldEllipsis, Search, MessageSquare, Send, ChevronRight, Info, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getRiskColor, getHighlightBg, capitalize } from '@/lib/utils'
import type { Clause, ChatMessage } from '@/lib/types'

interface DocumentData {
  id: string
  title: string
  documentText: string
  analysis: {
    summary: string
    overallRiskScore: number
    clauses: Clause[]
  }
  riskScore: number
}

export default function DocumentViewerPage() {
  const params = useParams()
  const docId = params.id as string

  const [docData, setDocData] = useState<DocumentData | null>(null)
  const [activeTab, setActiveTab] = useState<'original' | 'plain'>('plain')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Load document data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(`nyaysaathi_doc_${docId}`)
    if (stored) {
      const data = JSON.parse(stored)
      setDocData(data)
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm NyaySaathi. I've analyzed "${data.title}". Ask me anything about this document and I'll answer using only what's in it.`,
        },
      ])
    }
  }, [docId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    const text = chatInput.trim()
    if (!text || !docData || isSending) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: docData.documentText,
          question: text,
          history: messages.slice(-6), // Send last 6 messages for context
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        citation: data.citation,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${message}. Please try again.`,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  if (!docData) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Document not found. It may have been from a previous session.</p>
        <Button asChild>
          <Link href="/dashboard/upload">Upload a New Document</Link>
        </Button>
      </div>
    )
  }

  const { analysis } = docData
  const clauses = analysis?.clauses || []
  const riskScore = analysis?.overallRiskScore || 0

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4 border-b border-border mb-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to dashboard" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-serif text-primary truncate">
                {docData.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                <span>AI Analysis Complete</span>
                <span className={`flex items-center gap-1 font-semibold ${getRiskColor(riskScore)}`}>
                  {getRiskIcon(riskScore)}
                  Risk Score: {riskScore}/100
                </span>
                <span>{clauses.length} clauses identified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-5" style={{ height: 'calc(100vh - 10rem)' }}>
          {/* Document Viewer */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab Bar */}
            <div className="flex items-center justify-between bg-card px-3 py-2 rounded-t-xl border border-border border-b-0">
              <div className="flex bg-muted/80 p-0.5 rounded-lg" role="tablist" aria-label="Document view">
                <button
                  onClick={() => setActiveTab('original')}
                  role="tab"
                  aria-selected={activeTab === 'original'}
                  aria-controls="tab-original"
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === 'original'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Original Text
                </button>
                <button
                  onClick={() => setActiveTab('plain')}
                  role="tab"
                  aria-selected={activeTab === 'plain'}
                  aria-controls="tab-plain"
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === 'plain'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Plain Language
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-risk-danger/30 border border-risk-danger rounded-sm" /> Risk</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500/30 border border-amber-500 rounded-sm" /> Obligation</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-risk-safe/30 border border-risk-safe rounded-sm" /> Right</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500/30 border border-blue-500 rounded-sm" /> Deadline</span>
              </div>
            </div>

            {/* Document Content */}
            <Card className="flex-1 overflow-auto rounded-t-none border-t-0">
              <CardContent className="p-6 md:p-8 text-foreground font-sans leading-relaxed text-sm md:text-base">
                {activeTab === 'original' ? (
                  <div className="space-y-6" id="tab-original" role="tabpanel">
                    {clauses.map((clause) => (
                      <div key={clause.id}>
                        <h2 className="text-lg font-bold font-serif">{clause.id} — {clause.title}</h2>
                        <p className="leading-7 mt-2">
                          <span
                            className={`${getHighlightBg(clause.riskTag)} px-0.5 rounded-sm cursor-help`}
                            title={`${capitalize(clause.riskTag)}: ${clause.plainLanguage}`}
                          >
                            {clause.originalText}
                          </span>
                        </p>
                      </div>
                    ))}
                    {clauses.length === 0 && (
                      <p className="text-muted-foreground italic">No clauses were identified in this document.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6" id="tab-plain" role="tabpanel">
                    {/* AI Summary Banner */}
                    <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20">
                      <h3 className="font-semibold text-secondary flex items-center gap-2 mb-2 text-sm">
                        <Search className="w-4 h-4" /> AI Summary
                      </h3>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {analysis.summary}
                      </p>
                    </div>

                    {clauses.map((clause) => (
                      <div key={clause.id}>
                        <h2 className={`text-lg font-bold font-serif ${clause.riskLevel === 'danger' ? 'text-risk-danger' : ''}`}>
                          {clause.id} — {clause.title}
                        </h2>
                        <p className="leading-7 mt-2">{clause.plainLanguage}</p>

                        {clause.riskLevel !== 'safe' && clause.recommendation && (
                          <div className={`mt-3 p-4 rounded-r-lg ${
                            clause.riskLevel === 'danger'
                              ? 'border-l-4 border-risk-danger bg-risk-danger/5'
                              : 'border-l-4 border-amber-500 bg-amber-500/5'
                          }`}>
                            <h4 className={`font-semibold flex items-center gap-2 text-sm ${
                              clause.riskLevel === 'danger' ? 'text-risk-danger' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {clause.riskLevel === 'danger' ? (
                                <ShieldAlert className="w-4 h-4" />
                              ) : (
                                <Info className="w-4 h-4" />
                              )}
                              {clause.riskLevel === 'danger' ? 'Red Flag' : 'Caution'}: {clause.title}
                            </h4>
                            <p className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                              <strong>💡 Recommendation:</strong> {clause.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div className="w-full lg:w-[340px] flex flex-col shrink-0 min-h-0" style={{ height: 'calc(100vh - 10rem)' }}>
            <Card className="flex-1 overflow-hidden flex flex-col border-primary/20 rounded-xl">
              {/* Chat Header */}
              <div className="bg-primary px-4 py-3 text-primary-foreground shrink-0">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4" /> Document Q&amp;A
                </h3>
                <p className="text-[10px] text-primary-foreground/70 mt-0.5">Powered by Gemini AI — answers grounded in your document.</p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20" aria-live="polite">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                      {msg.citation && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          <ChevronRight className="w-3 h-3" />
                          <span>Source: {msg.citation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-xl rounded-bl-sm p-3 flex items-center gap-2 text-sm text-muted-foreground" role="status">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border bg-card shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="e.g., Can I break the lease early?"
                    className="flex-1 text-sm p-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    disabled={isSending}
                    aria-label="Ask a question about the document"
                  />
                  <Button type="submit" size="icon" className="shrink-0 w-10 h-10" aria-label="Send message" disabled={!chatInput.trim() || isSending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-[9px] text-center text-muted-foreground mt-1.5">
                  NyaySaathi can make mistakes. This is not legal advice.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper — kept local because it returns JSX (not suitable for utils.ts)
function getRiskIcon(score: number) {
  if (score >= 70) return <ShieldAlert className="w-3.5 h-3.5" />
  if (score >= 40) return <ShieldEllipsis className="w-3.5 h-3.5" />
  return <ShieldCheck className="w-3.5 h-3.5" />
}
