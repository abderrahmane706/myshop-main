import { create } from 'zustand';

export const useOrderForm = create((set) => ({
  isOpen: false,
  product: null,
  quantity: 1,
  open: (product, qty = 1) => set({ isOpen: true, product, quantity: qty }),
  close: () => set({ isOpen: false, product: null, quantity: 1 }),
}));
