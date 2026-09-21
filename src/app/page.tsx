'use client'

import HeroPage from '@/components/hero'
import { FileSearch, ShieldCheck, Scale, FileText, MessageSquare, Download, ArrowRight, AlertTriangle, BookOpen, HelpCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full">
      <HeroPage />

      {/* Features Section */}
      <section id="features" className="w-full py-20 md:py-28 px-6 md:px-16 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-16">
          <div className="text-center space-y-4 max-w-2xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-secondary uppercase tracking-widest"
            >
              How it works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-serif text-primary leading-tight"
            >
              From confusing legalese to clear action items
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              NyaySaathi reads your document, highlights what matters, and tells you exactly what to ask your lawyer.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <FeatureCard
              icon={<FileSearch className="w-7 h-7" />}
              step="01"
              title="Upload"
              description="Drop a PDF, Word file, or photo of any contract, lease, or policy."
              delay={0.05}
            />
            <FeatureCard
              icon={<FileText className="w-7 h-7" />}
              step="02"
              title="Simplify"
              description="See the original text beside a plain-language version, clause by clause."
              delay={0.15}
            />
            <FeatureCard
              icon={<ShieldCheck className="w-7 h-7" />}
              step="03"
              title="Spot Risks"
              description="Color-coded highlights flag obligations, rights, deadlines, and penalties."
              delay={0.25}
            />
            <FeatureCard
              icon={<Scale className="w-7 h-7" />}
              step="04"
              title="Take Action"
              description="Get a checklist of red flags, negotiation points, and questions for your lawyer."
              delay={0.35}
            />
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="w-full py-20 md:py-28 px-6 md:px-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-secondary uppercase tracking-widest">
              Capabilities
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-primary leading-tight">
              Everything you need to understand a legal document
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CapabilityCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Document Q&amp;A"
              description="Ask questions in plain language and get answers grounded only in your document, with clause citations."
            />
            <CapabilityCard
              icon={<Scale className="w-6 h-6" />}
              title="Side-by-Side Compare"
              description="Upload two versions and see exactly what changed, with AI explanations of why it matters."
            />
            <CapabilityCard
              icon={<Download className="w-6 h-6" />}
              title="Export Reports"
              description="Generate a branded PDF checklist of red flags, negotiation points, and lawyer questions."
            />
            <CapabilityCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Legal Glossary"
              description="Hover on any legal term for a plain-English definition. Searchable glossary included."
            />
            <CapabilityCard
              icon={<HelpCircle className="w-6 h-6" />}
              title="Find Legal Help"
              description="Directory of legal aid resources and lawyer referrals when you need professional advice."
            />
            <CapabilityCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Multilingual"
              description="Summaries, clause notes, and chat answers available in English, Hindi, or Hinglish."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-28 px-6 md:px-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center bg-primary rounded-3xl p-10 md:p-16 shadow-2xl shadow-primary/20"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4 leading-tight">
            Ready to understand your next contract?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
            Upload your first document and get a plain-language summary in seconds. No credit card needed.
          </p>
          <Button size="lg" variant="secondary" className="font-sans text-base h-12 px-8 shadow-lg" asChild>
            <Link href="/dashboard/upload">
              Start Free Analysis <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Scale className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-serif font-bold text-primary">NyaySaathi</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                An AI-powered legal companion that simplifies documents, compares agreements, flags risky clauses, and answers questions in plain language — without replacing a lawyer.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard/upload" className="hover:text-foreground transition-colors">Upload</Link></li>
                <li><Link href="/dashboard/compare" className="hover:text-foreground transition-colors">Compare</Link></li>
                <li><Link href="/glossary" className="hover:text-foreground transition-colors">Glossary</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/find-help" className="hover:text-foreground transition-colors">Find Legal Help</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">&copy; 2024 NyaySaathi. All rights reserved.</p>
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              NyaySaathi provides information, not legal advice. Always consult a qualified lawyer.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, step, title, description, delay }: { icon: React.ReactNode, step: string, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative flex flex-col p-6 bg-card rounded-2xl border border-border hover:border-secondary/40 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest mb-4">Step {step}</span>
      <div className="w-14 h-14 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold font-sans text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}

function CapabilityCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex gap-4 p-5 rounded-xl hover:bg-card transition-colors"
    >
      <div className="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold font-sans text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}
