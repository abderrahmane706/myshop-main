'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/store/language';

const BRANDS = [
  'DAR EL GHOURABAA', 'GHOURABAA HOROLOGY', 'MAISON NOIR', 'ATELIER OR', 'SAHARA SCENTS', 'CASA BLANCA CO.',
];

export function LogoStrip() {
  const lang = useLanguage(s => s.lang);
  return (
    <section className="border-y border-brand-primary/5 bg-white">
      <div className="container py-6">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-brand-text/40 mb-4">
          {lang==='ar' ? 'موثوق من طرف أفضل العلامات' : 'Trusted by leading brands'}
        </p>
        <div className="flex items-center justify-around gap-8 flex-wrap opacity-40">
          {BRANDS.map((b, i) => (
            <motion.div key={b}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="text-xs md:text-sm font-bold tracking-[0.15em] text-brand-dark">
              {b}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
