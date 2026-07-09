'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Percent, Truck, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/store/language';
import { PRODUCTS } from '@/lib/data/products';

export function PromoBanner() {
  const lang = useLanguage(s => s.lang);
  const featured = PRODUCTS.find(p => p.slug === 'aurum-chronograph') || PRODUCTS[4];

  return (
    <section className="py-8 md:py-14">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-brand-dark min-h-[380px] md:min-h-[420px]">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark" />
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-royal/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-brand-orange/30 blur-3xl" />

          <div className="relative grid md:grid-cols-2 items-center gap-8 p-8 md:p-14">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full glass-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
                <Percent className="h-3 w-3"/> {lang==='ar'?'عروض محدودة':'Limited offer'}
              </div>
              <h2 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
                {lang==='ar' ? <>حتى <span className="text-brand-orange">40٪</span> خصم<br/>على الساعات الفاخرة</> :
                                <>Up to <span className="text-brand-orange">40% off</span><br/>on premium watches</>}
              </h2>
              <p className="mt-4 text-white/70 max-w-md">
                {lang==='ar'?'مجموعة محدودة — حتى نفاد الكمية. فرصتك لاقتناء قطعة استثنائية بهامش ربح أقل.':'Limited stock. Once it\'s gone, it\'s gone. Own something exceptional — without the exceptional markup.'}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link href="/products?category=watches">
                  <button className="h-12 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-sm flex items-center gap-2 shadow-orange transition">
                    {lang==='ar'?'تسوق الآن':'Shop watches'}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </Link>
                <div className="hidden sm:flex items-center gap-4 ms-2 text-white/70 text-xs">
                  <div className="flex items-center gap-1.5"><Truck className="h-4 w-4"/> Free shipping</div>
                  <div className="flex items-center gap-1.5"><Shield className="h-4 w-4"/> COD available</div>
                </div>
              </div>
            </div>

            <div className="relative hidden md:block h-72">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                className="absolute inset-0 grid place-items-center">
                <div className="relative w-64 h-72 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src={featured.images[0]} alt="" className="w-full h-full object-cover" />
                  <div className="absolute -bottom-3 -left-4 bg-white rounded-2xl px-4 py-2 shadow-soft-lg">
                    <div className="text-[10px] text-brand-text/60 uppercase tracking-widest">from</div>
                    <div className="text-brand-primary font-bold text-xl">$249</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
