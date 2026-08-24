// =============================================================================
// Zustand Store — سبد استعلام (Persistent Inquiry Cart)
// لایه: 8.3 (Client State) — طبق اصل معماری، Zustand فقط برای موارد کاملاً
// کلاینتی استفاده می‌شود؛ داده‌های اصلی همیشه از Server Components می‌آیند.
// این استور با localStorage پایدار (persist) می‌شود تا سبد کاربر بین بازدیدها
// حفظ شود (Persistent Inquiry به‌معنای واقعی در سمت مرورگر).
// =============================================================================
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INQUIRY_CART_STORAGE_KEY } from '@/lib/utils/constants';

export interface InquiryCartItem {
  productId: string;
  productSlug: string;
  productNameFa: string;
  productImageUrl: string;
  sizeId: string;
  sizeLabel: string;
  quantityBox: number;
  note?: string;
}

interface InquiryCartState {
  items: InquiryCartItem[];
  sessionToken: string;
  isDrawerOpen: boolean;
  addItem: (item: InquiryCartItem) => void;
  removeItem: (sizeId: string) => void;
  updateQuantity: (sizeId: string, quantityBox: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

function createSessionToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useInquiryCartStore = create<InquiryCartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionToken: createSessionToken(),
      isDrawerOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.sizeId === item.sizeId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.sizeId === item.sizeId ? { ...i, quantityBox: i.quantityBox + item.quantityBox } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
        set({ isDrawerOpen: true });
      },

      removeItem: (sizeId) => {
        set({ items: get().items.filter((i) => i.sizeId !== sizeId) });
      },

      updateQuantity: (sizeId, quantityBox) => {
        if (quantityBox <= 0) {
          get().removeItem(sizeId);
          return;
        }
        set({
          items: get().items.map((i) => (i.sizeId === sizeId ? { ...i, quantityBox } : i)),
        });
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set({ isDrawerOpen: !get().isDrawerOpen }),
    }),
    {
      name: INQUIRY_CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items, sessionToken: state.sessionToken }),
    }
  )
);
