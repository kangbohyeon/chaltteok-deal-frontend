import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productUuid: string;
  name: string;
  price: number;
  thumbnailUrl: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productUuid: string) => void;
  updateQuantity: (productUuid: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productUuid === item.productUuid);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productUuid === item.productUuid
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (productUuid) =>
        set((state) => ({ items: state.items.filter((i) => i.productUuid !== productUuid) })),
      updateQuantity: (productUuid, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productUuid !== productUuid)
              : state.items.map((i) =>
                  i.productUuid === productUuid ? { ...i, quantity } : i
                ),
        })),
      clearCart: () => set({ items: [] }),
      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "chaltteok-cart",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
);
