import { detectDocType, getRiskLabel } from '@/lib/utils'

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
})
