import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product: string; // Product ID
  title: string;
  price: number;
  seller: string; // Seller ID
  image: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const exists = currentItems.find(i => i.product === item.product);
        if (!exists) {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.product !== productId),
      })),
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + item.price, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
