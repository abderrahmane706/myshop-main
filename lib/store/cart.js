'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useStorefront } from '@/lib/store/storefront';

export const useCart = create(
  persist(
    (set, get) => ({
      items: [], // { id, name_en, name_ar, price, image, qty, slug }
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),
      add: (product, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex(i => i.id === product.id);
        if (idx >= 0) items[idx].qty = Math.min(items[idx].qty + qty, product.stock || 99);
        else items.push({
          id: product.id, slug: product.slug,
          name_en: product.name_en, name_ar: product.name_ar,
          price: product.price, compare_at: product.compare_at,
          image: product.images?.[0], qty,
          stock: product.stock || 99,
        });
        set({ items, isOpen: true });
      },
      updateQty: (id, qty) => {
        const items = get().items.map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i);
        set({ items });
      },
      remove: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.qty * i.price, 0),
      shipping: () => {
        if (get().items.length === 0) return 0;
        const sub = get().subtotal();
        const settings = useStorefront.getState().settings || {};
        const threshold = Number(settings.free_shipping_threshold) || 0;
        if (threshold > 0 && sub >= threshold) return 0;
        return Number(settings.shipping_price_dz) || 400;
      },
      total: () => get().subtotal() + get().shipping(),
    }),
    { name: 'dgm-cart', partialize: (s) => ({ items: s.items }) }
  )
);
