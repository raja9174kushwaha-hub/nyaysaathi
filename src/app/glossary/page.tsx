'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const GLOSSARY_TERMS = [
  { term: 'Arbitration', definition: 'A way to resolve disputes outside of court, where a neutral third party (arbitrator) makes a binding decision. Often faster and cheaper than going to court.' },
  { term: 'Breach of Contract', definition: 'When one party fails to fulfil their obligations under a contract. This can lead to legal action and damages.' },
  { term: 'Clause', definition: 'A specific section or provision within a contract that addresses a particular topic or obligation.' },
  { term: 'Consideration', definition: 'Something of value exchanged between parties to a contract — usually money, goods, or services. A contract without consideration is generally not enforceable.' },
  { term: 'Cure Period', definition: 'A set amount of time given to fix (cure) a breach or default before the other party can take action, such as terminating the contract.' },
  { term: 'Default', definition: 'Failure to meet a legal obligation or the terms of a contract, such as not paying rent on time.' },
  { term: 'Force Majeure', definition: 'A clause that frees both parties from obligation when an extraordinary event beyond their control occurs (e.g., natural disaster, war, pandemic).' },
  { term: 'Indemnification', definition: 'A promise by one party to compensate the other for any losses or damages that arise from the contract.' },
  { term: 'Jurisdiction', definition: 'The geographical area or court system that has the authority to hear a legal case related to the contract.' },
  { term: 'Liability', definition: 'Legal responsibility for something. Limited liability means there is a cap on the amount of damages a party can be held responsible for.' },
  { term: 'Lien', definition: 'A legal right or interest that a creditor has in the debtor\u2019s property, lasting until the debt is satisfied.' },
  { term: 'Non-Compete Clause', definition: 'A restriction preventing one party from engaging in business activities that compete with the other party, usually for a set time and geography.' },
  { term: 'Non-Disclosure Agreement (NDA)', definition: 'A legal contract where one or both parties agree not to share confidential information.' },
  { term: 'Power of Attorney', definition: 'A legal document giving one person the authority to act on behalf of another in legal or financial matters.' },
  { term: 'Prevailing Party', definition: 'The party that wins a legal dispute. A "prevailing party clause" means the loser pays the winner\u2019s legal fees.' },
  { term: 'Severability', definition: 'A clause stating that if one part of the contract is found to be invalid, the rest of the contract remains in effect.' },
  { term: 'Statute of Limitations', definition: 'The maximum time after an event within which legal proceedings may be initiated. After this period, a claim cannot be brought.' },
  { term: 'Sublet', definition: 'When a tenant rents out part or all of their rented property to another person (subtenant). Many leases require landlord approval.' },
  { term: 'Termination Clause', definition: 'A section of a contract that describes when and how either party can end the agreement, including any required notice periods.' },
  { term: 'Waiver', definition: 'When a party voluntarily gives up a right or claim. For example, a landlord waiving a late fee does not mean they waive the right to charge it in the future.' },
]

export default function GlossaryPage() {
  const [search, setSearch] = useState('')

  const filtered = GLOSSARY_TERMS.filter(
    (item) =>
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase())
  )

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
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary">Legal Glossary</h1>
          </div>
          <p className="text-muted-foreground">
            Plain-language definitions for common legal terms. These same definitions appear as hover tooltips inside your documents.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Terms Grid */}
        <motion.div layout className="min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center py-16 text-muted-foreground"
              >
                <p className="text-lg font-medium">No terms found</p>
                <p className="text-sm mt-1">Try a different search term.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="grid" 
                layout 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filtered.map((item, index) => (
                  <motion.div
                    key={item.term}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 25,
                      delay: index * 0.05 
                    }}
                  >
                    <Card className="hover:border-secondary/30 transition-colors h-full">
                      <CardContent className="p-5 flex flex-col h-full">
                        <h3 className="font-bold text-foreground font-serif text-base mb-1.5">{item.term}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.definition}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Showing {filtered.length} of {GLOSSARY_TERMS.length} terms. These are general definitions and may not apply to your specific situation.
        </p>
      </div>
    </div>
  )
}
