import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  variant_id: number | null;
  quantity: number;
  // Snapshots for display (no need to refetch product when rendering cart)
  name: string;
  variant_name: string | null;
  unit_price: number;
  member_price: number | null;
  image_url: string | null;
  is_pre_order: boolean;
  has_variants: boolean;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null, quantity: number) => void;
  clear: () => void;
  itemCount: () => number;
  total: (isMember: boolean) => number;
}

const sameLine = (a: CartItem, b: { product_id: number; variant_id: number | null }) =>
  a.product_id === b.product_id && (a.variant_id ?? null) === (b.variant_id ?? null);

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => sameLine(i, item));
        if (existing) {
          return {
            items: state.items.map((i) =>
              sameLine(i, item) ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter((i) => !sameLine(i, { product_id: productId, variant_id: variantId })),
      })),

      updateQuantity: (productId, variantId, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter((i) => !sameLine(i, { product_id: productId, variant_id: variantId })),
          };
        }
        return {
          items: state.items.map((i) =>
            sameLine(i, { product_id: productId, variant_id: variantId }) ? { ...i, quantity } : i,
          ),
        };
      }),

      clear: () => set({ items: [] }),

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      total: (isMember) => get().items.reduce((acc, i) => {
        const price = isMember && i.member_price !== null ? i.member_price : i.unit_price;
        return acc + price * i.quantity;
      }, 0),
    }),
    {
      name: 'apacg-cart-v1',
      // Solo persistimos items, no helpers
      partialize: (state) => ({ items: state.items }) as CartStore,
    },
  ),
);
