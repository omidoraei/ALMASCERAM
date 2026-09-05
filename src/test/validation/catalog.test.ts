import { describe, expect, it } from 'vitest'
import { catalogIdSchema, catalogSlugSchema, createCollectionSchema, createProductSchema, createSizeSchema, createSeriesSchema, updateCollectionSchema, updateProductSchema, updateSeriesSchema, updateSizeSchema } from '../../lib/validation/catalog'

describe('catalogIdSchema', () => {
  it('accepts a valid UUID', () => {
    expect(() => catalogIdSchema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow()
  })
  it('rejects non-uuid strings', () => {
    expect(() => catalogIdSchema.parse('not-a-uuid')).toThrow()
    expect(() => catalogIdSchema.parse('12345')).toThrow()
    expect(() => catalogIdSchema.parse('')).toThrow()
  })
})

describe('catalogSlugSchema', () => {
  it('accepts lowercase alphanumeric with hyphens', () => {
    expect(() => catalogSlugSchema.parse('arena-sand')).not.toThrow()
    expect(() => catalogSlugSchema.parse('collection-1')).not.toThrow()
    expect(() => catalogSlugSchema.parse('a1b2c3')).not.toThrow()
  })
  it('rejects uppercase', () => {
    expect(() => catalogSlugSchema.parse('Arena-Sand')).toThrow()
  })
  it('rejects spaces and underscores', () => {
    expect(() => catalogSlugSchema.parse('arena sand')).toThrow()
    expect(() => catalogSlugSchema.parse('arena_sand')).toThrow()
  })
  it('rejects too-short and too-long slugs', () => {
    expect(() => catalogSlugSchema.parse('a')).toThrow()
    expect(() => catalogSlugSchema.parse('a'.repeat(121))).toThrow()
  })
  it('rejects leading/trailing/consecutive hyphens', () => {
    expect(() => catalogSlugSchema.parse('-arena')).toThrow()
    expect(() => catalogSlugSchema.parse('arena-')).toThrow()
    expect(() => catalogSlugSchema.parse('arena--sand')).toThrow()
  })
})

describe('createCollectionSchema', () => {
  const valid = { name: 'زمین', slug: 'zamin', description: null, coverImagePath: null, isActive: true, isPublished: true, sortOrder: 10, publishedAt: null }
  it('accepts a complete payload', () => {
    expect(() => createCollectionSchema.parse(valid)).not.toThrow()
  })
  it('rejects too-short name', () => {
    expect(() => createCollectionSchema.parse({ ...valid, name: 'a' })).toThrow()
  })
  it('rejects too-long description', () => {
    expect(() => createCollectionSchema.parse({ ...valid, description: 'a'.repeat(5001) })).toThrow()
  })

  it('accepts a non-UUID coverImagePath (path validation belongs at the storage layer)', () => {
    // The schema does not validate storage paths — that is enforced by
    // `safeObjectPathSchema` in storage-actions. Documenting the boundary here.
    expect(() => createCollectionSchema.parse({ ...valid, coverImagePath: 'collection-1/cover.jpg' })).not.toThrow()
  })
})

describe('createSeriesSchema — requires collection parent', () => {
  it('rejects when collectionId is missing', () => {
    expect(() => createSeriesSchema.parse({ name: 'آرنا', slug: 'arena' } as never)).toThrow()
  })
  it('rejects when collectionId is not a UUID', () => {
    expect(() => createSeriesSchema.parse({ name: 'آرنا', slug: 'arena', collectionId: 'not-uuid' })).toThrow()
  })
})

describe('createProductSchema — requires SKU and slug', () => {
  const valid = { seriesId: '550e8400-e29b-41d4-a716-446655440000', surfaceId: null, finishId: null, name: 'آرنا سند', slug: 'arena-sand', sku: 'KR-0101', description: null, colorName: null, isActive: true, isPublished: true, isFeatured: false, sortOrder: 0, publishedAt: null }
  it('accepts a valid product payload', () => {
    expect(() => createProductSchema.parse(valid)).not.toThrow()
  })
  it('rejects when SKU is missing', () => {
    expect(() => createProductSchema.parse({ ...valid, sku: '' })).toThrow()
  })
  it('rejects when slug has uppercase', () => {
    expect(() => createProductSchema.parse({ ...valid, slug: 'Arena-Sand' })).toThrow()
  })
})

describe('createSizeSchema — dimension bounds', () => {
  const valid = { productId: '550e8400-e29b-41d4-a716-446655440000', widthMm: 600, heightMm: 1200, thicknessMm: 9, isRectified: true, piecesPerBox: null, sqmPerBox: null, boxWeightKg: null, isActive: true, sortOrder: 0 }
  it('accepts realistic dimensions', () => {
    expect(() => createSizeSchema.parse(valid)).not.toThrow()
  })
  it('rejects width larger than 5000mm', () => {
    expect(() => createSizeSchema.parse({ ...valid, widthMm: 5001 })).toThrow()
  })
  it('rejects zero or negative dimensions', () => {
    expect(() => createSizeSchema.parse({ ...valid, widthMm: 0 })).toThrow()
    expect(() => createSizeSchema.parse({ ...valid, thicknessMm: -1 })).toThrow()
  })
})

describe('update*Schema — require at least one field', () => {
  it('updateCollectionSchema rejects empty object', () => {
    expect(() => updateCollectionSchema.parse({})).toThrow(/حداقل یک فیلد/)
  })
  it('updateProductSchema rejects empty object', () => {
    expect(() => updateProductSchema.parse({})).toThrow(/حداقل یک فیلد/)
  })
  it('updateSeriesSchema accepts partial name update', () => {
    expect(() => updateSeriesSchema.parse({ name: 'نام جدید' })).not.toThrow()
  })
  it('updateSizeSchema accepts single dimension', () => {
    expect(() => updateSizeSchema.parse({ widthMm: 800 })).not.toThrow()
  })
})
