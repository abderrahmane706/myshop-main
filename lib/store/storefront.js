import { create } from 'zustand';

export const useStorefront = create((set) => ({
  products: [],
  categories: [],
  settings: {},
  setStorefrontData: (data) => set(data),
}));
