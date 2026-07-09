'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/store/language';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const lang = useLanguage(s => s.lang);
  const toggle = useLanguage(s => s.toggle);
  return (
    <button onClick={toggle}
      className="relative inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-brand-primary/10 hover:border-brand-primary/30 hover:bg-brand-bg transition text-xs font-semibold uppercase tracking-wider">
      <Globe className="h-3.5 w-3.5 text-brand-royal" />
      <motion.span key={lang} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="tabular-nums text-brand-dark">
        {lang === 'en' ? 'EN' : 'AR'}
      </motion.span>
    </button>
  );
}
