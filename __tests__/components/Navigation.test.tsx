import React from 'react'
import { render, screen } from '@testing-library/react'
import Navigation from '@/components/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/dashboard'),
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn().mockReturnValue({ theme: 'light', setTheme: jest.fn() }),
}))

describe('Navigation Component', () => {
  it('renders brand logo and title', () => {
    render(<Navigation />)
    const brandLinks = screen.getAllByText('NyaySaathi')
    expect(brandLinks.length).toBeGreaterThan(0)
  })

  it('renders all navigation links', () => {
    render(<Navigation />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Compare')).toBeInTheDocument()
    expect(screen.getByText('Glossary')).toBeInTheDocument()
    expect(screen.getByText('Find Help')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    render(<Navigation />)
    const signInButtons = screen.getAllByText('Sign In')
    expect(signInButtons.length).toBeGreaterThan(0)
  })
})
