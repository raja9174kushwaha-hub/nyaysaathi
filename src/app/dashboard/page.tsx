'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ShieldAlert, ShieldCheck, ShieldEllipsis, Clock, GitCompare, ArrowRight, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getRiskColor, getRiskBg } from '@/lib/utils'

interface StoredDoc {
  id: string
  title: string
  type: string
  date: string
  riskScore: number
  riskLevel: string
  status: string
  clauses: number
}

function getRiskIcon(score: number) {
  if (score >= 70) return <ShieldAlert className="w-5 h-5 text-risk-danger" />
  if (score >= 40) return <ShieldEllipsis className="w-5 h-5 text-risk-caution" />
  return <ShieldCheck className="w-5 h-5 text-risk-safe" />
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<StoredDoc[]>([])

  useEffect(() => {
    const stored = sessionStorage.getItem('nyaysaathi_docs')
    if (stored) {
      try {
        setDocuments(JSON.parse(stored))
      } catch {
        setDocuments([])
      }
    }
  }, [])

  const safeCount = documents.filter(d => d.riskScore < 40).length
  const cautionCount = documents.filter(d => d.riskScore >= 40 && d.riskScore < 70).length
  const dangerCount = documents.filter(d => d.riskScore >= 70).length

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary mb-1">My Documents</h1>
            <p className="text-muted-foreground text-sm">Manage and analyze your legal documents with AI.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 font-sans" asChild>
              <Link href="/dashboard/compare">
                <GitCompare className="w-4 h-4" />
                Compare
              </Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans gap-2" asChild>
              <Link href="/dashboard/upload">
                <Plus className="w-4 h-4" />
                New Analysis
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Documents"
            value={documents.length.toString()}
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            label="Safe"
            value={safeCount.toString()}
            icon={<ShieldCheck className="w-5 h-5" />}
            color="text-risk-safe"
          />
          <StatCard
            label="Caution"
            value={cautionCount.toString()}
            icon={<ShieldEllipsis className="w-5 h-5" />}
            color="text-risk-caution"
          />
          <StatCard
            label="High Risk"
            value={dangerCount.toString()}
            icon={<ShieldAlert className="w-5 h-5" />}
            color="text-risk-danger"
          />
        </div>

        {/* Document List */}
        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <UploadCloud className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-serif text-primary mb-2">No documents yet</h2>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Upload your first legal document — a contract, lease, or policy — and get an AI-powered risk analysis in seconds.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans gap-2" asChild>
              <Link href="/dashboard/upload">
                <Plus className="w-4 h-4" />
                Upload Your First Document
              </Link>
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-primary">Recent Analyses</h2>
              <span className="text-xs text-muted-foreground">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col gap-3">
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <Link href={`/dashboard/document/${doc.id}`}>
                    <Card className="hover:border-primary/40 transition-all duration-200 cursor-pointer group hover:shadow-md">
                      <CardContent className="p-4 md:p-5 flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl ${getRiskBg(doc.riskScore)} flex items-center justify-center shrink-0`}>
                          <FileText className={`w-5 h-5 ${getRiskColor(doc.riskScore)}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {doc.title}
                          </h3>
                          <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {doc.date}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{doc.type}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{doc.clauses} clauses</span>
                          </div>
                        </div>

                        {/* Risk Score */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            {getRiskIcon(doc.riskScore)}
                            <span className={`text-lg font-bold tabular-nums ${getRiskColor(doc.riskScore)}`}>
                              {doc.riskScore}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 ${color || 'text-primary'}`}>
          {icon}
        </div>
        <div>
          <div className={`text-2xl font-bold font-serif tabular-nums ${color || 'text-foreground'}`}>{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}
