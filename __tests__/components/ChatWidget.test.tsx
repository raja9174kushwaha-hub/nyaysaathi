import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ChatWidget } from '@/components/chat-widget'

jest.mock('framer-motion', () => {
  const React = require('react')
  const MotionDiv = React.forwardRef(({ initial, animate, exit, transition, whileHover, whileTap, ...props }: any, ref: any) =>
    React.createElement('div', { ...props, ref })
  )
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: { div: MotionDiv },
  }
})

describe('ChatWidget', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock
  })

  it('opens accessibly and sends a question to the general chat API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'A security deposit is held against specified costs.' }),
    })

    render(<ChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open assistant chat' }))

    const input = screen.getByRole('textbox', { name: 'Message NyaySaathi' })
    fireEvent.change(input, { target: { value: 'What is a security deposit?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/general-chat', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('What is a security deposit?'),
      }))
    })
    expect(await screen.findByText('A security deposit is held against specified costs.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close assistant chat' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('limits sent history to the API maximum during long conversations', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ answer: 'Reply.' }) })

    render(<ChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open assistant chat' }))
    const input = screen.getByRole('textbox', { name: 'Message NyaySaathi' })
    const sendButton = screen.getByRole('button', { name: 'Send message' })

    for (let index = 0; index < 11; index++) {
      fireEvent.change(input, { target: { value: `Question ${index}` } })
      fireEvent.click(sendButton)
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(index + 1))
      await waitFor(() => expect(screen.queryByText('Thinking...')).not.toBeInTheDocument())
    }

    const lastRequest = fetchMock.mock.calls[10][1]
    expect(JSON.parse(lastRequest.body).history).toHaveLength(20)
  })
})