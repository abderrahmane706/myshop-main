'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/store/cart';
import { useLanguage } from '@/lib/store/language';
import { LanguageToggle } from '@/components/LanguageToggle';
import { cn } from '@/lib/utils';
import { useStorefront } from '@/lib/store/storefront';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const count = useCart(s => s.count());
  const openCart = useCart(s => s.open);
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const router = useRouter();
  
  const PRODUCTS = useStorefront(s => s.products);
  const CATEGORIES = useStorefront(s => s.categories);
  const settings = useStorefront(s => s.settings) || {};
  const threshold = Number(settings.free_shipping_threshold) || 150;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggestions = query.length > 1
    ? PRODUCTS.filter(p => (lang==='ar'?p.name_ar:p.name_en).toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const nav = [
    { href: '/products', label: t('nav.shop') },
    { href: '/products?category=perfumes', label: lang==='ar'?'العطور':'Perfumes' },
    { href: '/products?category=watches', label: lang==='ar'?'الساعات':'Watches' },
    { href: '/products?category=accessories', label: lang==='ar'?'الإكسسوارات':'Accessories' },
    { href: '/products?category=new-collection', label: t('nav.new') },
    { href: '/products?category=sale', label: t('nav.sale') },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-brand-dark text-white text-xs">
        <div className="container flex items-center justify-between h-9">
          <p className="opacity-80">{lang==='ar' ? `شحن مجاني للطلبات فوق ${threshold} · دفع عند الاستلام` : `Free shipping over ${threshold} DZD · Cash on delivery`}</p>
          <div className="hidden md:flex items-center gap-4 opacity-80">
            <Link href="#" className="hover:text-brand-orange transition">Track order</Link>
            <span>|</span>
            <Link href="#" className="hover:text-brand-orange transition">Help</Link>
          </div>
        </div>
      </div>

      <header className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled ? 'bg-white/85 backdrop-blur-xl shadow-soft border-b border-black/5' : 'bg-white border-b border-transparent'
      )}>
        <div className="container">
          <div className="flex items-center h-16 md:h-20 gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-label={lang==='ar' ? 'فتح القائمة' : 'Open navigation menu'}
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-brand-bg"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-9 w-9 rounded-xl bg-brand-gradient-soft grid place-items-center shadow-brand">
                <span className="text-white font-bold text-sm">DG</span>
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-[15px] font-semibold tracking-tight text-brand-dark">Dar el Ghourabaa</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-brand-royal">Market</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 ms-6">
              {nav.map(n => (
                <Link key={n.href} href={n.href} className="px-3 py-2 text-sm text-brand-text/80 hover:text-brand-primary transition rounded-md hover:bg-brand-bg">
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex-1 max-w-md mx-auto hidden md:block relative">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text/40" />
                <Input
                  placeholder={t('nav.search')}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  className="ps-9 h-10 bg-brand-bg border-transparent focus-visible:ring-2 focus-visible:ring-brand-royal/40 rounded-full"
                />
              </div>
              <AnimatePresence>
              {searchOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-soft-lg border border-black/5 overflow-hidden z-50">
                  {suggestions.map(p => (
                    <Link key={p.id} href={`/products/${p.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-brand-bg transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{lang==='ar'?p.name_ar:p.name_en}</div>
                        <div className="text-xs text-brand-text/60">{p.brand}</div>
                      </div>
                      <div className="text-sm font-semibold text-brand-primary">${p.price}</div>
                    </Link>
                  ))}
                  <button onClick={() => router.push(`/products?q=${encodeURIComponent(query)}`)} className="w-full text-center p-3 text-sm text-brand-royal hover:bg-brand-royal-50 border-t">
                    {lang==='ar'?'عرض جميع النتائج':'View all results'}
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            <div className="ms-auto flex items-center gap-1">
              <LanguageToggle />
              <button className="hidden md:grid place-items-center h-10 w-10 rounded-full hover:bg-brand-bg transition">
                <Heart className="h-5 w-5 text-brand-text/70" />
              </button>
              <button className="hidden md:grid place-items-center h-10 w-10 rounded-full hover:bg-brand-bg transition">
                <User className="h-5 w-5 text-brand-text/70" />
              </button>
              <button onClick={openCart} className="relative grid place-items-center h-10 w-10 rounded-full hover:bg-brand-bg transition">
                <ShoppingBag className="h-5 w-5 text-brand-text/80" />
                {count > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} key={count}
                    className="absolute -top-0.5 -end-0.5 h-5 min-w-5 px-1 rounded-full bg-brand-orange text-white text-[10px] font-bold grid place-items-center shadow-orange">
                    {count}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)}>
            <motion.div
              initial={{ x: lang==='ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang==='ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className={cn(
                'absolute top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col',
                lang==='ar' ? 'end-0' : 'start-0'
              )}>
              <div className="flex items-center justify-between p-5 border-b">
                <div className="font-semibold text-brand-dark">Menu</div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-brand-bg"><X className="h-5 w-5"/></button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3">
                {nav.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-brand-bg text-brand-text">
                    <span className="font-medium">{n.label}</span>
                    <ChevronDown className="h-4 w-4 opacity-40 rtl:rotate-180" />
                  </Link>
                ))}
              </nav>
              <div className="p-5 border-t space-y-2">
                <Button variant="outline" className="w-full h-11 rounded-full border-brand-primary/20">
                  <User className="h-4 w-4 me-2" /> {t('nav.signIn')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </header>
    </>
  );
}
