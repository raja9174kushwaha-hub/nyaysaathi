"use client"

import React from 'react'
import ScalesOfJustice3D from './scales-of-justice'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

const HeroPage = () => {
  return (
    <section
      className="relative flex flex-col-reverse md:flex-row items-center justify-center w-full min-h-[calc(100vh-4rem)] pt-16 px-6 md:px-16 overflow-hidden"
      id="about"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Left: Copy */}
      <div className="flex flex-col gap-6 md:w-1/2 max-w-2xl z-10 pb-8 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-4 py-2 rounded-full w-fit"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">This tool provides information, not legal advice</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-primary leading-[1.1] tracking-tight"
        >
          Your AI Legal{' '}
          <span className="text-secondary inline-block">Companion</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-muted-foreground font-sans max-w-lg leading-relaxed"
        >
          Upload contracts, spot risky clauses, get plain-language summaries, compare versions, and generate checklists for your lawyer — in English, Hindi, or Hinglish.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-2"
        >
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-base h-12 px-8 shadow-lg shadow-primary/20" asChild>
            <Link href="/dashboard/upload">
              Analyze a Document
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="font-sans text-base h-12 px-8" asChild>
            <Link href="#features">
              How it works
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center gap-6 mt-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-risk-safe" />
            Free to try
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            Multilingual
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Encrypted
          </div>
        </motion.div>
      </div>

      {/* Right: 3D */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[550px] flex items-center justify-center relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/15 rounded-full blur-[80px]" />
        <ScalesOfJustice3D />
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-muted-foreground"
      >
        <span className="text-xs">Scroll to learn more</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </motion.div>
    </section>
  )
}

export default HeroPage
