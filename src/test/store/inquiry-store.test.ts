import { beforeEach, describe, expect, it } from 'vitest'
import { useInquiryStore } from '../../store/inquiry-store'
import type { Product, TileSize } from '../../types/catalog'

const mockSize: TileSize = {
  id: '120-240',
  label: '۱۲۰ × ۲۴۰',
  widthMm: 1200,
  heightMm: 2400,
  thicknessMm: 9,
  faces: 6,
  weightKg: 56.2,
}

const mockProduct: Product = {
  id: 'arena-sand',
  name: 'آرنا سند',
  englishName: 'ARENA SAND',
  slug: 'arena-sand',
  series: 'آرنا',
  collection: 'زمین',
  category: 'سنگ',
  finish: 'مات',
  applications: ['کف', 'دیوار'],
  image: '/images/products/tile-arena.svg',
  tone: '#c8bba5',
  sizes: [mockSize],
  technical: {
    waterAbsorption: 'کمتر از ۰٫۵٪',
    breakingStrength: 'بیش از ۱۳۰۰ نیوتن',
    abrasionResistance: 'کلاس PEI IV',
    frostResistance: 'مقاوم',
    shadeVariation: 'V2',
  },
}

describe('inquiry store', () => {
  beforeEach(() => {
    useInquiryStore.getState().clear()
  })

  it('starts empty', () => {
    expect(useInquiryStore.getState().items).toHaveLength(0)
  })

  it('addItem appends a new line', () => {
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    const items = useInquiryStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      key: 'arena-sand:120-240',
      productId: 'arena-sand',
      productName: 'آرنا سند',
      series: 'آرنا',
      image: '/images/products/tile-arena.svg',
      quantity: 1,
    })
    expect(items[0].size).toEqual(mockSize)
  })

  it('addItem merges duplicates by incrementing quantity', () => {
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    const items = useInquiryStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('addItem treats different sizes of the same product as separate lines', () => {
    const sizeA: TileSize = { ...mockSize, id: '80-160' }
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().addItem(mockProduct, sizeA)
    expect(useInquiryStore.getState().items).toHaveLength(2)
  })

  it('removeItem drops a line by key', () => {
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().removeItem('arena-sand:120-240')
    expect(useInquiryStore.getState().items).toHaveLength(0)
  })

  it('removeItem is a no-op for an unknown key', () => {
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().removeItem('does-not-exist')
    expect(useInquiryStore.getState().items).toHaveLength(1)
  })

  it('setQuantity updates quantity and clamps to at least 1', () => {
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().setQuantity('arena-sand:120-240', 5)
    expect(useInquiryStore.getState().items[0].quantity).toBe(5)
    useInquiryStore.getState().setQuantity('arena-sand:120-240', 0)
    expect(useInquiryStore.getState().items[0].quantity).toBe(1)
    useInquiryStore.getState().setQuantity('arena-sand:120-240', -3)
    expect(useInquiryStore.getState().items[0].quantity).toBe(1)
  })

  it('setQuantity is a no-op for an unknown key', () => {
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().setQuantity('does-not-exist', 99)
    expect(useInquiryStore.getState().items).toHaveLength(1)
    expect(useInquiryStore.getState().items[0].quantity).toBe(1)
  })

  it('clear empties the cart', () => {
    useInquiryStore.getState().addItem(mockProduct, mockSize)
    useInquiryStore.getState().addItem({ ...mockProduct, id: 'urban-grey' }, mockSize)
    useInquiryStore.getState().clear()
    expect(useInquiryStore.getState().items).toHaveLength(0)
  })
})
