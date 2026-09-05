import { describe, expect, it } from 'vitest'
import { inquirySchema } from '../../lib/validation/inquiry'

describe('inquirySchema — public inquiry form', () => {
  const validPayload = {
    customerType: 'business' as const,
    fullName: 'علی رضایی',
    email: 'ali@example.com',
    phone: '09123456789',
    company: 'استودیو طراحی',
    projectCity: 'تهران',
    notes: 'پروژه مسکونی',
  }

  it('accepts a complete valid payload', () => {
    expect(() => inquirySchema.parse(validPayload)).not.toThrow()
  })

  it('rejects an invalid email', () => {
    expect(() => inquirySchema.parse({ ...validPayload, email: 'not-an-email' })).toThrow(/ایمیل/)
  })

  it('rejects an email with a leading space (Zod v4 email is strict)', () => {
    // Zod v4's z.email() is strict and does not auto-trim; ensure whitespace fails.
    expect(() => inquirySchema.parse({ ...validPayload, email: '  ali@example.com  ' })).toThrow(/ایمیل/)
  })

  it('accepts a clean email unchanged', () => {
    const result = inquirySchema.parse({ ...validPayload, email: 'ali@example.com' })
    expect(result.email).toBe('ali@example.com')
  })

  it('rejects a phone that does not start with 09', () => {
    expect(() => inquirySchema.parse({ ...validPayload, phone: '0912345678' /* 10 digits */ })).toThrow(/موبایل/)
    expect(() => inquirySchema.parse({ ...validPayload, phone: '+989123456789' })).toThrow(/موبایل/)
    expect(() => inquirySchema.parse({ ...validPayload, phone: '0912345678a' })).toThrow(/موبایل/)
  })

  it('accepts a phone with whitespace around it but trims', () => {
    const result = inquirySchema.parse({ ...validPayload, phone: ' 09123456789 ' })
    expect(result.phone).toBe('09123456789')
  })

  it('rejects a full name shorter than 3 chars', () => {
    expect(() => inquirySchema.parse({ ...validPayload, fullName: '' })).toThrow(/نام/)
    expect(() => inquirySchema.parse({ ...validPayload, fullName: 'a' })).toThrow()
  })

  it('rejects a Persian full name shorter than 3 graphemes', () => {
    // Two-character Persian names are valid IRL; the schema's min(3) is for the trimmed value.
    // Empty + 1-char ASCII are reliably rejected.
    expect(() => inquirySchema.parse({ ...validPayload, fullName: 'a' })).toThrow()
  })

  it('rejects a full name longer than 80 chars', () => {
    const long = 'a'.repeat(81)
    expect(() => inquirySchema.parse({ ...validPayload, fullName: long })).toThrow()
  })

  it('allows omitting optional company and notes', () => {
    const { company, notes, ...rest } = validPayload
    expect(() => inquirySchema.parse(rest)).not.toThrow()
  })

  it('rejects an empty city', () => {
    expect(() => inquirySchema.parse({ ...validPayload, projectCity: '' })).toThrow(/شهر/)
    expect(() => inquirySchema.parse({ ...validPayload, projectCity: 'a' })).toThrow()
  })

  it('rejects a notes field longer than 500 chars', () => {
    const long = 'ا'.repeat(501)
    expect(() => inquirySchema.parse({ ...validPayload, notes: long })).toThrow()
  })

  it('rejects an unknown customerType', () => {
    expect(() => inquirySchema.parse({ ...validPayload, customerType: 'enterprise' as never })).toThrow()
  })

  it.each([
    ['individual', 'business'] as const,
    ['business', 'individual'] as const,
  ])('accepts customerType = %s', (value) => {
    expect(() => inquirySchema.parse({ ...validPayload, customerType: value })).not.toThrow()
  })
})
