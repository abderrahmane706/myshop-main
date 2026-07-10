'use client';
import { motion } from 'framer-motion';
import { useStorefront } from '@/lib/store/storefront';
import { ProductCard } from '@/components/ProductCard';
import { useLanguage } from '@/lib/store/language';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeaturedSection() {
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const PRODUCTS = useStorefront(s => s.products);
  const items = PRODUCTS.filter(p => p.featured);
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-brand-dark tracking-tight text-balance">
              {t('sections.featured')}
            </motion.h2>
            <p className="mt-3 text-brand-text/60 text-lg">{t('sections.featuredSub')}</p>
          </div>
          <Link href="/products" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-royal hover:text-brand-primary">
            {lang==='ar'?'عرض الكل':'View all'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {items.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
