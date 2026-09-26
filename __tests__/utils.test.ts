import {
  detectDocType,
  getRiskLabel,
  getRiskColor,
  getRiskBg,
  getHighlightBg,
  capitalize,
  convertToHtml,
  convertFromHtml,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('detectDocType', () => {
    it('should detect Lease correctly', () => {
      expect(detectDocType('My_Apartment_Lease_2024.pdf')).toBe('Lease')
      expect(detectDocType('RENT_AGREEMENT.txt')).toBe('Lease')
    })

    it('should detect Contract correctly', () => {
      expect(detectDocType('Employment_Contract.pdf')).toBe('Contract')
      expect(detectDocType('Service Agreement Final.docx')).toBe('Contract')
    })

    it('should detect ToS correctly', () => {
      expect(detectDocType('Privacy_Policy.pdf')).toBe('ToS')
      expect(detectDocType('Terms_of_Service.txt')).toBe('ToS')
      expect(detectDocType('TOS_v2.pdf')).toBe('ToS')
    })

    it('should detect NDA correctly', () => {
      expect(detectDocType('Confidentiality_NDA.pdf')).toBe('NDA')
      expect(detectDocType('Non-Disclosure Agreement.pdf')).toBe('NDA')
    })

    it('should default to Document for unknown types', () => {
      expect(detectDocType('random_file.pdf')).toBe('Document')
      expect(detectDocType('Meeting_Notes.txt')).toBe('Document')
    })
  })

  describe('getRiskLabel', () => {
    it('should return Safe for scores below 40', () => {
      expect(getRiskLabel(0)).toBe('Safe')
      expect(getRiskLabel(39)).toBe('Safe')
    })

    it('should return Caution for scores between 40 and 69', () => {
      expect(getRiskLabel(40)).toBe('Caution')
      expect(getRiskLabel(55)).toBe('Caution')
      expect(getRiskLabel(69)).toBe('Caution')
    })

    it('should return High Risk for scores 70 and above', () => {
      expect(getRiskLabel(70)).toBe('High Risk')
      expect(getRiskLabel(99)).toBe('High Risk')
      expect(getRiskLabel(100)).toBe('High Risk')
    })
  })

  describe('getRiskColor', () => {
    it('should return danger color for high scores', () => {
      expect(getRiskColor(70)).toBe('text-risk-danger')
      expect(getRiskColor(100)).toBe('text-risk-danger')
    })

    it('should return caution color for medium scores', () => {
      expect(getRiskColor(40)).toBe('text-risk-caution')
      expect(getRiskColor(69)).toBe('text-risk-caution')
    })

    it('should return safe color for low scores', () => {
      expect(getRiskColor(0)).toBe('text-risk-safe')
      expect(getRiskColor(39)).toBe('text-risk-safe')
    })
  })

  describe('getRiskBg', () => {
    it('should return danger bg for high scores', () => {
      expect(getRiskBg(70)).toBe('bg-risk-danger/10')
    })

    it('should return caution bg for medium scores', () => {
      expect(getRiskBg(50)).toBe('bg-risk-caution/10')
    })

    it('should return safe bg for low scores', () => {
      expect(getRiskBg(10)).toBe('bg-risk-safe/10')
    })
  })

  describe('getHighlightBg', () => {
    it('should return correct classes for risk tag', () => {
      expect(getHighlightBg('risk')).toContain('risk-danger')
    })

    it('should return correct classes for obligation tag', () => {
      expect(getHighlightBg('obligation')).toContain('amber-500')
    })

    it('should return correct classes for right tag', () => {
      expect(getHighlightBg('right')).toContain('risk-safe')
    })

    it('should return correct classes for deadline tag', () => {
      expect(getHighlightBg('deadline')).toContain('blue-500')
    })

    it('should return default classes for unknown tag', () => {
      expect(getHighlightBg('unknown')).toContain('muted')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should handle single character', () => {
      expect(capitalize('h')).toBe('H')
    })

    it('should handle already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })
  })

  describe('convertToHtml', () => {
    it('should convert bold markdown to strong tags', () => {
      expect(convertToHtml('**bold text**')).toBe('<strong>bold text</strong>')
    })

    it('should convert newlines to br tags', () => {
      expect(convertToHtml('line1\nline2')).toBe('line1<br/>line2')
    })

    it('should convert square brackets to placeholder spans', () => {
      expect(convertToHtml('[placeholder]')).toBe('<span class="placeholder">placeholder</span>')
    })

    it('should return empty string for empty input', () => {
      expect(convertToHtml('')).toBe('')
    })

    it('should handle mixed formatting', () => {
      const input = '**Title**\n[Name] agrees'
      const expected = '<strong>Title</strong><br/><span class="placeholder">Name</span> agrees'
      expect(convertToHtml(input)).toBe(expected)
    })
  })

  describe('convertFromHtml', () => {
    it('should convert strong tags to bold markdown', () => {
      expect(convertFromHtml('<strong>bold</strong>')).toBe('**bold**')
    })

    it('should convert br tags to newlines', () => {
      expect(convertFromHtml('line1<br/>line2')).toBe('line1\nline2')
    })

    it('should convert placeholder spans to brackets', () => {
      expect(convertFromHtml('<span class="placeholder">name</span>')).toBe('[name]')
    })

    it('should return empty string for undefined input', () => {
      expect(convertFromHtml(undefined)).toBe('')
    })

    it('should return empty string for empty string input', () => {
      expect(convertFromHtml('')).toBe('')
    })

    it('should be the inverse of convertToHtml', () => {
      const original = '**Title**\n[Name] agrees'
      expect(convertFromHtml(convertToHtml(original))).toBe(original)
    })
  })
})
