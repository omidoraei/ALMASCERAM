import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InquiryItem, Product, TileSize } from '../types/catalog'

type InquiryState = {
  items: InquiryItem[]
  addItem: (product: Product, size: TileSize) => void
  removeItem: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clear: () => void
}

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, size) => set((state) => {
        const key = `${product.id}:${size.id}`
        const existing = state.items.find((item) => item.key === key)
        if (existing) {
          return { items: state.items.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item) }
        }
        return {
          items: [...state.items, {
            key,
            productId: product.id,
            productName: product.name,
            series: product.series,
            image: product.image,
            size,
            quantity: 1,
          }],
        }
      }),
      removeItem: (key) => set((state) => ({ items: state.items.filter((item) => item.key !== key) })),
      setQuantity: (key, quantity) => set((state) => ({
        items: state.items.map((item) => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item),
      })),
      clear: () => set({ items: [] }),
    }),
    { name: 'kara-persistent-inquiry', version: 1 },
  ),
)
