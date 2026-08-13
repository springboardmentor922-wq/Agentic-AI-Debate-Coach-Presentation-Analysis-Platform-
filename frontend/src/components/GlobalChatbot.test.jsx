import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as AuthContext from '../context/AuthContext'
import coachChatApi from '../api/coachChat'
import GlobalChatbot from './GlobalChatbot'

/**
 * Regression coverage for the markdown rendering upgrade: the previous
 * renderer only understood **bold** and "- " bullets, so a table or code
 * block in a reply rendered as literal pipe/backtick characters. This
 * confirms react-markdown + remark-gfm actually produce real <table>,
 * <code>, and safely-attributed <a> elements now.
 */
describe('GlobalChatbot markdown rendering', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', full_name: 'Test Learner', role: 'learner' },
    })
    vi.spyOn(coachChatApi, 'createSession').mockResolvedValue({ id: 'session-1', title: 'New chat' })
    vi.spyOn(coachChatApi, 'listSessions').mockResolvedValue([])
    vi.spyOn(coachChatApi, 'getMessages').mockResolvedValue([])
  })

  it('renders a markdown table, fenced code block, and a safe external link as real elements', async () => {
    const reply = [
      '| Metric | Score |',
      '|---|---|',
      '| Clarity | 8/10 |',
      '',
      '```',
      'const x = 1;',
      '```',
      '',
      'See [source](https://example.com) for more.',
    ].join('\n')

    vi.spyOn(coachChatApi, 'streamMessage').mockImplementation(async (_sid, _text, _pk, _arg, { onDone }) => {
      onDone({ id: 'm1', role: 'assistant', text: reply, agents_used: [], suggested_questions: [], created_at: new Date().toISOString() })
    })

    render(
      <MemoryRouter>
        <GlobalChatbot />
      </MemoryRouter>
    )

    // Open the widget and send a message.
    fireEvent.click(screen.getByLabelText('Open AI Debate Coach'))
    const input = await screen.findByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'How did I do?' } })
    fireEvent.submit(input.closest('form'))

    await waitFor(() => expect(screen.getByText('Clarity')).toBeInTheDocument())

    // Real table structure, not literal "| Clarity | 8/10 |" text.
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('8/10')).toBeInTheDocument()

    // Real fenced code block, not literal backticks in the text.
    const codeEl = screen.getByText('const x = 1;')
    expect(codeEl.tagName.toLowerCase()).toBe('code')

    // Link opens safely in a new tab and never leaks referrer/opener.
    const link = screen.getByRole('link', { name: 'source' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('shows a timestamp on a sent message', async () => {
    vi.spyOn(coachChatApi, 'streamMessage').mockImplementation(async (_sid, _text, _pk, _arg, { onDone }) => {
      onDone({ id: 'm1', role: 'assistant', text: 'Sure, happy to help.', agents_used: [], suggested_questions: [], created_at: new Date().toISOString() })
    })

    render(
      <MemoryRouter>
        <GlobalChatbot />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('Open AI Debate Coach'))
    const input = await screen.findByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Hi there' } })
    fireEvent.submit(input.closest('form'))

    await waitFor(() => expect(screen.getByText('Sure, happy to help.')).toBeInTheDocument())
    // A timestamp like "3:45 PM" should render next to at least one message.
    expect(screen.getAllByText(/\d{1,2}:\d{2}\s?(AM|PM)?/i).length).toBeGreaterThan(0)
  })
})
