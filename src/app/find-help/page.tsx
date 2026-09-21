'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, HelpCircle, Phone, MapPin, Globe, Scale, Building, Users } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const LEGAL_AID_RESOURCES = [
  {
    name: 'National Legal Services Authority (NALSA)',
    description: 'Free legal services for weaker sections of society including SC/ST, women, children, and those below the poverty line.',
    url: 'https://nalsa.gov.in',
    phone: '15100',
    type: 'Government',
    icon: Building,
  },
  {
    name: 'District Legal Services Authority',
    description: 'Every district in India has a DLSA that provides free legal aid, Lok Adalats, and legal awareness camps.',
    url: 'https://nalsa.gov.in/slsa',
    phone: 'Contact your district court',
    type: 'Government',
    icon: MapPin,
  },
  {
    name: 'Tele-Law Service (CSC)',
    description: 'Free legal consultation via video call through Common Service Centres across India. Available in multiple languages.',
    url: 'https://www.tele-law.in',
    phone: '1800-11-4000',
    type: 'Government',
    icon: Phone,
  },
  {
    name: 'Bar Council of India',
    description: 'The regulatory body for lawyers in India. Find registered advocates and verify lawyer credentials.',
    url: 'https://www.barcouncilofindia.org',
    phone: 'See website',
    type: 'Regulatory',
    icon: Scale,
  },
  {
    name: 'India Legal Aid (Pro Bono)',
    description: 'Platform connecting citizens with lawyers willing to provide free legal assistance on a case-by-case basis.',
    url: 'https://www.indiankanoon.org',
    phone: 'Online only',
    type: 'Non-Profit',
    icon: Users,
  },
  {
    name: 'Consumer Helpline',
    description: 'For consumer disputes related to products, services, or unfair trade practices. File complaints online or via phone.',
    url: 'https://consumerhelpline.gov.in',
    phone: '1800-11-4000',
    type: 'Government',
    icon: Globe,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export default function FindHelpPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-secondary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary">Find Legal Help</h1>
          </div>
          <p className="text-muted-foreground">
            NyaySaathi is not a substitute for a lawyer. If you need professional legal advice, here are trusted resources to get started.
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-5 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Scale className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-700 dark:text-amber-400 text-sm">When to consult a lawyer</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  If NyaySaathi flags high-risk clauses, if you are signing a contract worth more than ₹5 lakhs, if you are facing eviction or a lawsuit, or if you simply feel unsure — please speak with a qualified legal professional.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {LEGAL_AID_RESOURCES.map((resource) => {
            const Icon = resource.icon
            return (
              <motion.div key={resource.name} variants={itemVariants}>
                <Card className="hover:border-primary/30 transition-colors group h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground text-sm leading-tight">{resource.name}</h3>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{resource.type}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-grow">{resource.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{resource.phone}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-primary" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          Visit <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-10 max-w-lg mx-auto leading-relaxed">
          These are sample entries for demonstration. NyaySaathi does not endorse any specific legal service provider. Always verify credentials before hiring a lawyer.
        </p>
      </div>
    </div>
  )
}
