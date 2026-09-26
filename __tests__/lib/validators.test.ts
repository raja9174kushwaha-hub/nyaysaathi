import {
  analyzeSchema,
  chatSchema,
  compareSchema,
  sanitizeText,
  isAllowedFileExtension,
  isFileSizeAllowed,
  validateRequestBody,
  MAX_FILE_SIZE,
} from '@/lib/validators'

describe('Validators', () => {
  describe('analyzeSchema', () => {
    it('should accept valid text', () => {
      const result = analyzeSchema.safeParse({ text: 'This is a valid legal document with enough text to analyze.' })
      expect(result.success).toBe(true)
    })

    it('should reject empty text', () => {
      const result = analyzeSchema.safeParse({ text: '' })
      expect(result.success).toBe(false)
    })

    it('should reject text shorter than 20 characters', () => {
      const result = analyzeSchema.safeParse({ text: 'Too short' })
      expect(result.success).toBe(false)
    })

    it('should reject missing text field', () => {
      const result = analyzeSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('chatSchema', () => {
    it('should accept valid chat input', () => {
      const result = chatSchema.safeParse({
        documentText: 'A valid document with at least twenty characters.',
        question: 'What does clause 3 mean?',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing question', () => {
      const result = chatSchema.safeParse({
        documentText: 'A valid document with at least twenty characters.',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing documentText', () => {
      const result = chatSchema.safeParse({
        question: 'What does clause 3 mean?',
      })
      expect(result.success).toBe(false)
    })

    it('should accept optional history', () => {
      const result = chatSchema.safeParse({
        documentText: 'A valid document with at least twenty characters.',
        question: 'What does clause 3 mean?',
        history: [{ role: 'user', content: 'Hello' }],
      })
      expect(result.success).toBe(true)
    })

    it('should default history to empty array', () => {
      const result = chatSchema.safeParse({
        documentText: 'A valid document with at least twenty characters.',
        question: 'What does clause 3 mean?',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.history).toEqual([])
      }
    })
  })

  describe('compareSchema', () => {
    it('should accept valid comparison input', () => {
      const result = compareSchema.safeParse({
        textA: 'Original document text that is long enough to validate.',
        textB: 'Revised document text that is also long enough to pass.',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing textA', () => {
      const result = compareSchema.safeParse({
        textB: 'Revised document text that is long enough.',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing textB', () => {
      const result = compareSchema.safeParse({
        textA: 'Original document text that is long enough.',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('sanitizeText', () => {
    it('should remove null bytes', () => {
      expect(sanitizeText('Hello\0World')).toBe('HelloWorld')
    })

    it('should remove control characters but keep newlines and tabs', () => {
      expect(sanitizeText('Hello\x01\x02World\nNew\tTab')).toBe('HelloWorld\nNew\tTab')
    })

    it('should trim whitespace', () => {
      expect(sanitizeText('  hello world  ')).toBe('hello world')
    })

    it('should handle empty string', () => {
      expect(sanitizeText('')).toBe('')
    })

    it('should preserve normal legal text', () => {
      const text = 'Section 4.1: The tenant agrees to pay ₹25,000/month.'
      expect(sanitizeText(text)).toBe(text)
    })
  })

  describe('isAllowedFileExtension', () => {
    it('should allow .pdf files', () => {
      expect(isAllowedFileExtension('document.pdf')).toBe(true)
    })

    it('should allow .txt files', () => {
      expect(isAllowedFileExtension('contract.txt')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(isAllowedFileExtension('CONTRACT.PDF')).toBe(true)
    })

    it('should reject .docx files', () => {
      expect(isAllowedFileExtension('document.docx')).toBe(false)
    })

    it('should reject .exe files', () => {
      expect(isAllowedFileExtension('malware.exe')).toBe(false)
    })
  })

  describe('isFileSizeAllowed', () => {
    it('should allow files under 10MB', () => {
      expect(isFileSizeAllowed(5 * 1024 * 1024)).toBe(true)
    })

    it('should allow files exactly at 10MB', () => {
      expect(isFileSizeAllowed(MAX_FILE_SIZE)).toBe(true)
    })

    it('should reject files over 10MB', () => {
      expect(isFileSizeAllowed(MAX_FILE_SIZE + 1)).toBe(false)
    })

    it('should reject zero-byte files', () => {
      expect(isFileSizeAllowed(0)).toBe(false)
    })

    it('should reject negative sizes', () => {
      expect(isFileSizeAllowed(-1)).toBe(false)
    })
  })

  describe('validateRequestBody', () => {
    it('should return validated data for valid input', () => {
      const result = validateRequestBody(analyzeSchema, {
        text: 'A valid document with at least twenty characters for analysis.',
      })
      expect(result.text).toBe('A valid document with at least twenty characters for analysis.')
    })

    it('should throw descriptive error for invalid input', () => {
      expect(() => {
        validateRequestBody(analyzeSchema, { text: '' })
      }).toThrow()
    })
  })
})
