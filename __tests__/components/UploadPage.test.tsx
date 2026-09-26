import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import UploadPage from '@/app/dashboard/upload/page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('framer-motion', () => {
  const React = require('react')
  const MotionDiv = React.forwardRef(({ initial, animate, exit, transition, ...props }: any, ref: any) =>
    React.createElement('div', { ...props, ref })
  )
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: { div: MotionDiv },
  }
})

describe('UploadPage', () => {
  const fetchMock = jest.fn()
  const documentText = 'This is a sufficiently long legal document for analysis.'

  beforeEach(() => {
    sessionStorage.clear()
    mockPush.mockReset()
    fetchMock.mockReset()
    global.fetch = fetchMock
  })

  it('analyzes a text file and opens the resulting document', async () => {
    const analysis = {
      summary: 'A test summary.',
      overallRiskScore: 20,
      clauses: [],
    }
    fetchMock.mockResolvedValue({ ok: true, json: async () => analysis })

    const file = new File([documentText], 'contract.TXT', { type: 'text/plain' })
    Object.defineProperty(file, 'text', { value: jest.fn().mockResolvedValue(documentText) })

    render(<UploadPage />)
    fireEvent.change(screen.getByLabelText('Upload document file'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Start Analysis' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/analyze', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: documentText }),
      }))
    })
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/dashboard\/document\//)))
    expect(JSON.parse(sessionStorage.getItem('nyaysaathi_docs') || '[]')[0].title).toBe('contract.TXT')
  })

  it('shows API errors and lets the user retry', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'Analysis unavailable.' }) })

    const file = new File([documentText], 'contract.txt', { type: 'text/plain' })
    Object.defineProperty(file, 'text', { value: jest.fn().mockResolvedValue(documentText) })

    render(<UploadPage />)
    fireEvent.change(screen.getByLabelText('Upload document file'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Start Analysis' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Analysis unavailable.')
    expect(screen.getByRole('button', { name: 'Start Analysis' })).toBeEnabled()
  })
})