'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/store/language';
import { useStorefront } from '@/lib/store/storefront';
import { formatMoney } from '@/lib/utils';

export function HeroSection() {
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const PRODUCTS = useStorefront(s => s.products);

  const heroProducts = [PRODUCTS[0], PRODUCTS[4], PRODUCTS[8]];

  return (
    <section className="relative overflow-hidden bg-brand-bg">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
      <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-brand-royal/20 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -right-20 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl pointer-events-none" />

      <div className="container relative pt-14 pb-20 md:pt-24 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white shadow-soft px-4 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
              {t('hero.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-dark text-balance leading-[1.02]"
            >
              {t('hero.title')}<br/>
              <span className="gradient-text">{t('hero.titleAccent')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-brand-text/70 max-w-lg leading-relaxed text-balance"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/products">
                <Button size="lg" className="h-14 px-7 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-base font-semibold shadow-orange group">
                  {t('hero.cta')}
                  <ArrowRight className="h-5 w-5 ms-2 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Link href="/products?category=new-collection">
                <Button size="lg" variant="outline" className="h-14 px-7 rounded-full border-brand-dark/15 hover:bg-brand-dark hover:text-white hover:border-brand-dark text-base font-semibold">
                  {t('hero.cta2')}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-md"
            >
              {[
                { icon: Star, k: '25k+', v: t('hero.stat1'), color: 'text-brand-orange' },
                { icon: Sparkles, k: '500+', v: t('hero.stat2'), color: 'text-brand-royal' },
                { icon: Truck, k: '48h', v: t('hero.stat3'), color: 'text-brand-primary' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
                  <div className="text-2xl font-bold text-brand-dark">{s.k}</div>
                  <div className="text-xs text-brand-text/60 leading-tight">{s.v}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero visual: 3 product cards floating */}
          <div className="relative h-[520px] hidden lg:block">
            {heroProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: [-4, 6, -2][i] }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, rotate: 0, transition: { duration: 0.3 } }}
                className={`absolute w-64 h-80 rounded-3xl overflow-hidden shadow-soft-lg border border-white/60 ${
                  i === 0 ? 'left-0 top-8 z-10' : i === 1 ? 'left-52 top-32 z-20' : 'right-0 top-0 z-10'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="text-[10px] uppercase tracking-widest opacity-70">{p.brand}</div>
                  <div className="font-semibold text-sm mt-0.5 line-clamp-1">{lang==='ar'?p.name_ar:p.name_en}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-brand-orange text-lg">{formatMoney(p.price)}</span>
                    {p.compare_at && <span className="text-xs line-through opacity-60">{formatMoney(p.compare_at)}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, duration: 0.4 }}
              className="absolute -bottom-2 left-16 z-30 bg-white rounded-2xl shadow-soft-lg px-4 py-3 flex items-center gap-3 border border-black/5 animate-float"
            >
              <div className="h-10 w-10 rounded-full bg-brand-orange/10 grid place-items-center">
                <Shield className="h-5 w-5 text-brand-orange" />
              </div>
              <div className="leading-tight">
                <div className="text-xs text-brand-text/60">Cash on delivery</div>
                <div className="text-sm font-semibold text-brand-dark">Pay when it arrives</div>
              </div>
            </motion.div>
          </div>

          {/* Mobile hero image collage */}
          <div className="lg:hidden relative -mx-6 md:mx-0">
            <div className="grid grid-cols-3 gap-3 px-6">
              {heroProducts.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i*0.1 }}
                  className={`rounded-2xl overflow-hidden aspect-[3/4] shadow-soft ${i===1 ? 'translate-y-4' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
