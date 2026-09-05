import { describe, expect, it } from 'vitest'
import { createInquiryFromBasketSchema, inquiryBasketItemSchema } from '../../lib/validation/inquiry-basket'

describe('inquiryBasketItemSchema', () => {
  it('accepts a minimal valid item', () => {
    expect(() => inquiryBasketItemSchema.parse({ sizeId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 })).not.toThrow()
  })
  it('rejects quantity of zero or negative', () => {
    expect(() => inquiryBasketItemSchema.parse({ sizeId: '550e8400-e29b-41d4-a716-446655440000', quantity: 0 })).toThrow()
    expect(() => inquiryBasketItemSchema.parse({ sizeId: '550e8400-e29b-41d4-a716-446655440000', quantity: -1 })).toThrow()
  })
  it('rejects quantity over 100,000', () => {
    expect(() => inquiryBasketItemSchema.parse({ sizeId: '550e8400-e29b-41d4-a716-446655440000', quantity: 100_001 })).toThrow()
  })
  it('rejects a non-UUID sizeId', () => {
    expect(() => inquiryBasketItemSchema.parse({ sizeId: 'not-uuid', quantity: 1 })).toThrow()
  })
  it('rejects a note longer than 500 chars', () => {
    expect(() => inquiryBasketItemSchema.parse({ sizeId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, note: 'a'.repeat(501) })).toThrow()
  })
})

describe('createInquiryFromBasketSchema — duplicate detection', () => {
  const sizeA = '550e8400-e29b-41d4-a716-446655440000'
  const sizeB = '550e8400-e29b-41d4-a716-446655440001'

  it('accepts a basket with distinct sizes', () => {
    expect(() => createInquiryFromBasketSchema.parse({
      items: [{ sizeId: sizeA, quantity: 2 }, { sizeId: sizeB, quantity: 1 }],
    })).not.toThrow()
  })

  it('rejects a basket with duplicate sizeId (same size twice)', () => {
    expect(() => createInquiryFromBasketSchema.parse({
      items: [{ sizeId: sizeA, quantity: 1 }, { sizeId: sizeA, quantity: 2 }],
    })).toThrow(/یک‌بار/)
  })

  it('rejects an empty basket', () => {
    expect(() => createInquiryFromBasketSchema.parse({ items: [] })).toThrow(/خالی/)
  })

  it('rejects a basket with more than 50 items', () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      sizeId: `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`,
      quantity: 1,
    }))
    expect(() => createInquiryFromBasketSchema.parse({ items })).toThrow(/۵۰/)
  })

  it('rejects a note longer than 2000 chars', () => {
    expect(() => createInquiryFromBasketSchema.parse({
      items: [{ sizeId: sizeA, quantity: 1 }],
      note: 'a'.repeat(2001),
    })).toThrow()
  })
})
