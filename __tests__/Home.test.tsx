import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock the framer-motion library to avoid animation issues in Jest
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    __esModule: true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: new Proxy({}, {
      get: (_, prop: string) => {
        return React.forwardRef(({ initial, animate, exit, transition, variants, whileHover, whileInView, viewport, ...props }: any, ref: any) => {
          const Component = prop as any
          return <Component ref={ref} {...props} />
        })
      }
    })
  }
})

// Mock the Hero component so Three.js doesn't break the Jest node environment
jest.mock('@/components/hero', () => {
  return function DummyHero() {
    return (
      <div data-testid="mock-hero">
        <h1>Make Sense of Legal Jargon</h1>
      </div>
    )
  }
})

describe('Home', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    // Check if the main h1 exists
    const heading = screen.getByRole('heading', {
      name: /Make Sense of Legal Jargon/i,
    })
    
    expect(heading).toBeInTheDocument()
  })

  it('renders the call to action buttons', () => {
    render(<Home />)
    
    const analyzeButton = screen.getByText('Start Free Analysis')
    expect(analyzeButton).toBeInTheDocument()
  })
})
