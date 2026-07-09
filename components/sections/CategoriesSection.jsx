'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Watch, Gem, Gift, Star, Tag, ArrowRight } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '@/lib/data/products';
import { useLanguage } from '@/lib/store/language';

const iconMap = { Sparkles, Watch, Gem, Gift, Star, Tag };

export function CategoriesSection() {
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);

  // Take one representative image per category
  const withImage = CATEGORIES.map(c => ({
    ...c,
    image: PRODUCTS.find(p => p.category === c.slug)?.images[0] || PRODUCTS[0].images[0],
    count: PRODUCTS.filter(p => c.slug === 'new-collection' ? p.tags.includes('new-collection') : c.slug === 'sale' ? (p.tags.includes('sale') || p.compare_at) : p.category === c.slug).length,
  }));

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-brand-dark tracking-tight text-balance">
              {t('sections.categories')}
            </motion.h2>
            <p className="mt-3 text-brand-text/60 text-lg">{t('sections.categoriesSub')}</p>
          </div>
          <Link href="/products" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-royal hover:text-brand-primary">
            {lang==='ar'?'عرض الكل':'View all'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {withImage.map((c, i) => {
            const Icon = iconMap[c.icon] || Sparkles;
            return (
              <motion.div key={c.slug}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}>
                <Link href={`/products?category=${c.slug}`}
                  className="group relative block aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden bg-brand-bg">
                  <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                    <div className="h-9 w-9 rounded-full glass-dark grid place-items-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{lang==='ar'?c.name_ar:c.name_en}</h3>
                      <div className="text-xs opacity-70 mt-0.5">{c.count} {lang==='ar'?'منتج':'items'}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
