import { describe, expect, it } from 'vitest'
import { adminProductFormSchema, inquiryAdminStatusSchema } from '../../lib/validation/admin-catalog'

describe('adminProductFormSchema', () => {
  const valid = { name: 'آرنا سند', slug: 'arena-sand', sku: 'KR-0101', seriesId: 'series-1', description: 'توضیح کوتاه', isPublished: true }

  it('accepts a complete payload', () => {
    expect(() => adminProductFormSchema.parse(valid)).not.toThrow()
  })

  it('rejects when required fields are missing', () => {
    expect(() => adminProductFormSchema.parse({})).toThrow()
  })

  it('rejects a slug with spaces', () => {
    expect(() => adminProductFormSchema.parse({ ...valid, slug: 'arena sand' })).toThrow()
  })

  it('rejects a slug with uppercase', () => {
    expect(() => adminProductFormSchema.parse({ ...valid, slug: 'Arena-Sand' })).toThrow()
  })

  it('rejects a name shorter than 2 chars', () => {
    expect(() => adminProductFormSchema.parse({ ...valid, name: 'a' })).toThrow()
  })

  it('rejects a SKU shorter than 2 chars', () => {
    expect(() => adminProductFormSchema.parse({ ...valid, sku: 'K' })).toThrow()
  })

  it('accepts missing optional description', () => {
    const { description, ...rest } = valid
    expect(() => adminProductFormSchema.parse(rest)).not.toThrow()
  })
})

describe('inquiryAdminStatusSchema', () => {
  it('accepts the canonical enum values', () => {
    expect(inquiryAdminStatusSchema.parse('submitted')).toBe('submitted')
    expect(inquiryAdminStatusSchema.parse('in_review')).toBe('in_review')
    expect(inquiryAdminStatusSchema.parse('quoted')).toBe('quoted')
    expect(inquiryAdminStatusSchema.parse('closed')).toBe('closed')
    expect(inquiryAdminStatusSchema.parse('cancelled')).toBe('cancelled')
  })

  it('rejects an unknown status', () => {
    expect(() => inquiryAdminStatusSchema.parse('pending_verification')).toThrow()
    expect(() => inquiryAdminStatusSchema.parse('')).toThrow()
  })
})
