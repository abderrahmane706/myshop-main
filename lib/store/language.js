'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '@/lib/data/translations';

export const useLanguage = create(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => {
        set({ lang });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('lang', lang);
          document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        }
      },
      toggle: () => {
        const next = get().lang === 'en' ? 'ar' : 'en';
        get().setLang(next);
      },
      t: (path) => {
        const parts = path.split('.');
        let cur = translations[get().lang] || translations.en;
        for (const p of parts) { cur = cur?.[p]; if (cur === undefined) return path; }
        return cur;
      },
    }),
    { name: 'dgm-lang' }
  )
);
