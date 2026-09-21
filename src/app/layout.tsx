import type { Metadata } from 'next'
import { Inter as FontSans, Playfair_Display as FontSerif } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'
import Navigation from '@/components/navigation'
import { Toaster } from '@/components/ui/toaster'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontSerif = FontSerif({
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'NyaySaathi — AI Legal Companion',
  description:
    'An AI-powered legal companion that simplifies documents, compares agreements, flags risky clauses, and answers questions in plain language.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontSerif.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
