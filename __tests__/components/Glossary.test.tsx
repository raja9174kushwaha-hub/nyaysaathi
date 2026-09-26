import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import GlossaryPage from '@/app/glossary/page'

describe('Glossary Page', () => {
  it('renders heading and search input', () => {
    render(<GlossaryPage />)
    expect(screen.getByText('Legal Glossary')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search terms...')).toBeInTheDocument()
  })

  it('renders glossary terms', () => {
    render(<GlossaryPage />)
    expect(screen.getByText('Arbitration')).toBeInTheDocument()
    expect(screen.getByText('Breach of Contract')).toBeInTheDocument()
    expect(screen.getByText('Severability')).toBeInTheDocument()
  })

  it('filters terms when typing in search input', () => {
    render(<GlossaryPage />)
    const searchInput = screen.getByPlaceholderText('Search terms...')
    
    fireEvent.change(searchInput, { target: { value: 'Force Majeure' } })
    
    expect(screen.getByText('Force Majeure')).toBeInTheDocument()
    expect(screen.queryByText('Arbitration')).not.toBeInTheDocument()
  })

  it('shows no terms found message when query matches nothing', () => {
    render(<GlossaryPage />)
    const searchInput = screen.getByPlaceholderText('Search terms...')
    
    fireEvent.change(searchInput, { target: { value: 'xyznonexistentterm123' } })
    
    expect(screen.getByText('No terms found')).toBeInTheDocument()
  })
})
