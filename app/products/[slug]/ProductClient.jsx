'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Minus, Plus, Truck, Shield, RotateCcw, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStorefront } from '@/lib/store/storefront';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/lib/store/cart';
import { useLanguage } from '@/lib/store/language';
import { toast } from 'sonner';
import { formatMoney } from '@/lib/utils';

export function ProductClient({ product }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const add = useCart(s => s.add);
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  
  const PRODUCTS = useStorefront(s => s.products);
  const CATEGORIES = useStorefront(s => s.categories);

  const name = lang === 'ar' ? product.name_ar : product.name_en;
  const description = lang === 'ar' ? product.description_ar : product.description_en;
  const discount = product.compare_at ? Math.round(((product.compare_at - product.price) / product.compare_at) * 100) : 0;
  const savings = product.compare_at ? product.compare_at - product.price : 0;

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const categoryLabel = CATEGORIES.find(c => c.slug === product.category);
  const categoryName = categoryLabel ? (lang === 'ar' ? categoryLabel.name_ar : categoryLabel.name_en) : product.category;

  const handleAdd = () => {
    add(product, qty);
    toast.success(lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to your bag', { description: name });
  };
  const handleBuyNow = () => { handleAdd(); router.push('/checkout'); };

  return (
    <div className="container py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="text-xs uppercase tracking-widest text-brand-text/50 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-primary">{t('nav.home')}</Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <Link href="/products" className="hover:text-brand-primary">{t('nav.shop')}</Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <Link href={`/products?category=${product.category}`} className="hover:text-brand-primary">{categoryName}</Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-brand-bg cursor-zoom-in"
            onClick={() => setZoom(true)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={selectedImage}
              src={product.images[selectedImage]}
              alt={name}
              initial={{ opacity: 0.5, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 start-4 bg-brand-orange hover:bg-brand-orange text-white border-0 rounded-md text-sm font-bold px-3 py-1 shadow-orange">-{discount}%</Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${selectedImage === i ? 'border-brand-primary shadow-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-brand-royal font-semibold">{product.brand}</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-brand-dark tracking-tight text-balance">{name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-brand-orange text-brand-orange' : 'text-brand-text/20'}`} />
              ))}
              <span className="ms-1 text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-brand-text/60">({product.reviews_count} {t('product.reviews').toLowerCase()})</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-brand-primary">{formatMoney(product.price, 'DZD')}</span>
            {product.compare_at && (
              <>
                <span className="text-lg text-brand-text/40 line-through">{formatMoney(product.compare_at, 'DZD')}</span>
                <Badge variant="outline" className="border-brand-orange/30 text-brand-orange rounded-full">{t('product.save')} {formatMoney(savings, 'DZD')}</Badge>
              </>
            )}
          </div>

          <p className="mt-5 text-brand-text/70 leading-relaxed text-[15px]">{description}</p>

          {/* Stock */}
          <div className="mt-6 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-brand-success animate-pulse" />
                <span className="text-brand-success font-medium">{t('product.inStock')}</span>
                {product.stock < 15 && (
                  <span className="text-brand-orange text-xs">— {t('product.only')} {product.stock} {t('product.left')}</span>
                )}
              </>
            ) : (
              <span className="text-brand-error font-medium">{t('product.outOfStock')}</span>
            )}
          </div>

          {/* Qty + CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-brand-primary/15 bg-white">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label={lang === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'} className="h-12 w-12 grid place-items-center hover:text-brand-primary"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center text-base font-semibold" aria-live="polite" aria-atomic="true">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} aria-label={lang === 'ar' ? 'زيادة الكمية' : 'Increase quantity'} className="h-12 w-12 grid place-items-center hover:text-brand-primary"><Plus className="h-4 w-4" /></button>
            </div>
            <Button onClick={handleAdd} className="h-12 flex-1 min-w-[160px] rounded-full bg-brand-dark hover:bg-brand-dark-2 text-white font-semibold">
              {t('product.addToCart')}
            </Button>
            <Button onClick={handleBuyNow} className="h-12 flex-1 min-w-[160px] rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold shadow-orange">
              {t('product.buyNow')}
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <button className="flex items-center gap-1.5 text-brand-text/70 hover:text-brand-primary"><Heart className="h-4 w-4" /> {t('product.favorite')}</button>
            <button className="flex items-center gap-1.5 text-brand-text/70 hover:text-brand-primary"><Share2 className="h-4 w-4" /> {t('product.share')}</button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { Icon: Truck, k: t('product.free_shipping') },
              { Icon: Shield, k: t('product.cod') },
              { Icon: RotateCcw, k: t('product.returns') },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl bg-brand-bg p-3 text-xs">
                <b.Icon className="h-4 w-4 text-brand-royal shrink-0 mt-0.5" />
                <span className="text-brand-text/80 leading-tight">{b.k}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="specs" className="mt-10">
            <TabsList className="bg-brand-bg rounded-full h-11 p-1">
              <TabsTrigger value="specs" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-soft">{t('product.specs')}</TabsTrigger>
              <TabsTrigger value="description" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-soft">{t('product.description')}</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-soft">{t('product.reviews')}</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="mt-5">
              <dl className="divide-y">
                {product.specs.map((s, i) => (
                  <div key={i} className="flex justify-between py-3">
                    <dt className="text-brand-text/60">{s.k}</dt><dd className="font-medium text-brand-dark">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
            <TabsContent value="description" className="mt-5 text-brand-text/80 leading-relaxed">{description}</TabsContent>
            <TabsContent value="reviews" className="mt-5">
              <p className="text-brand-text/60">{product.reviews_count} {t('product.reviews').toLowerCase()} · {lang === 'ar' ? 'متوسط' : 'Average'} {product.rating}★</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-dark tracking-tight mb-8">{t('product.related')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4 cursor-zoom-out"
            onClick={() => setZoom(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              src={product.images[selectedImage]} alt="" className="max-h-full max-w-full rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
