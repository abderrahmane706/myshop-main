'use client';
import { motion } from 'framer-motion';
import { getNewArrivals } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
import { useLanguage } from '@/lib/store/language';

export function NewArrivalsSection() {
  const t = useLanguage(s => s.t);
  const items = getNewArrivals();
  if (items.length === 0) return null;
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container">
        <div className="mb-10">
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-brand-dark tracking-tight text-balance">
            {t('sections.newArrivals')}
          </motion.h2>
          <p className="mt-3 text-brand-text/60 text-lg">{t('sections.newArrivalsSub')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {items.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
