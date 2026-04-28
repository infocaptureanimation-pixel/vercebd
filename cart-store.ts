// src/store/cart-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed
  totalItems: () => number
  subtotal: () => number
  itemCount: (productId: string, variantId?: string) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIdx = state.items.findIndex(
            (i) => i.product.id === product.id && i.variant?.id === variant?.id
          )

          if (existingIdx >= 0) {
            const updated = [...state.items]
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: updated[existingIdx].quantity + quantity,
            }
            return { items: updated }
          }

          const newItem: CartItem = {
            id: `${product.id}-${variant?.id ?? 'default'}-${Date.now()}`,
            product,
            variant,
            quantity,
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.variant?.id === variantId)
          ),
        }))
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.variant?.id === variantId
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.variant?.price ?? i.product.price
          return sum + price * i.quantity
        }, 0),

      itemCount: (productId, variantId) => {
        const item = get().items.find(
          (i) => i.product.id === productId && i.variant?.id === variantId
        )
        return item?.quantity ?? 0
      },
    }),
    {
      name: 'verce-bd-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// ─── LANGUAGE STORE ──────────────────────────────────────────────────────────
type Language = 'en' | 'bn'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set({ language: get().language === 'en' ? 'bn' : 'en' }),
    }),
    {
      name: 'verce-bd-language',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
