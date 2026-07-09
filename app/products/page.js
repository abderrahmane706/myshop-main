'use client';
import { useState, useMemo, Suspense, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { PRODUCTS, CATEGORIES, getProductsByCategory } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
import { useLanguage } from '@/lib/store/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';

function ProductsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const category = params.get('category') || 'all';
  const q = params.get('q') || '';
  const lang = useLanguage(s => s.lang);
  const t = useLanguage(s => s.t);

  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sort, setSort] = useState('featured');
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState(q);
  const searchRef = useRef(null);

  // Wire ?focus=search from mobile tab bar — auto-focus the search input
  useEffect(() => {
    if (params.get('focus') === 'search' && searchRef.current) {
      searchRef.current.focus();
    }
  }, [params]);

  const filtered = useMemo(() => {
    let list = getProductsByCategory(category);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p =>
        p.name_en.toLowerCase().includes(s) || p.name_ar.includes(s) ||
        p.brand.toLowerCase().includes(s) || p.category.includes(s)
      );
    }
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1] && p.rating >= minRating);
    if (sort === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price);
    else if (sort === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price);
    else if (sort === 'rating') list = [...list].sort((a,b)=>b.rating-a.rating);
    else if (sort === 'newest') list = [...list].sort((a,b)=>(b.tags.includes('new-collection')?1:0)-(a.tags.includes('new-collection')?1:0));
    return list;
  }, [category, search, priceRange, sort, minRating]);

  const currentCat = CATEGORIES.find(c => c.slug === category);

  return (
    <div className="container py-8 md:py-14">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-brand-text/50 mb-2">
          {lang==='ar'?'المتجر':'Shop'} / {currentCat ? (lang==='ar'?currentCat.name_ar:currentCat.name_en) : (lang==='ar'?'الكل':'All')}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-brand-dark tracking-tight">
          {currentCat ? (lang==='ar'?currentCat.name_ar:currentCat.name_en) : (lang==='ar'?'جميع المنتجات':'All products')}
        </h1>
        <p className="mt-2 text-brand-text/60">{filtered.length} {lang==='ar'?'منتج':'products'}</p>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0 mb-6">
        <button onClick={()=>router.push('/products')}
          className={cn('shrink-0 h-9 px-4 rounded-full text-sm font-medium transition',
            category==='all' ? 'bg-brand-dark text-white' : 'bg-white border border-brand-primary/10 text-brand-text hover:border-brand-primary/40')}>
          {lang==='ar'?'الكل':'All'}
        </button>
        {CATEGORIES.map(c => (
          <button key={c.slug} onClick={()=>router.push(`/products?category=${c.slug}`)}
            className={cn('shrink-0 h-9 px-4 rounded-full text-sm font-medium transition',
              category===c.slug ? 'bg-brand-dark text-white' : 'bg-white border border-brand-primary/10 text-brand-text hover:border-brand-primary/40')}>
            {lang==='ar'?c.name_ar:c.name_en}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Mobile filter backdrop */}
        {filtersOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* Filters */}
        <aside className={cn(
          'lg:sticky lg:top-24 lg:self-start bg-white rounded-2xl border border-black/5 shadow-soft p-6 lg:block',
          filtersOpen ? 'fixed inset-x-4 top-24 z-40 max-h-[80vh] overflow-y-auto' : 'hidden'
        )}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-brand-dark">{lang==='ar'?'الفلاتر':'Filters'}</h3>
            <button onClick={()=>setFiltersOpen(false)} className="lg:hidden"><X className="h-5 w-5"/></button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-2 block">{lang==='ar'?'البحث':'Search'}</label>
              <Input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('nav.search')} className="h-10 rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-3 block">{lang==='ar'?'السعر':'Price'}</label>
              <Slider min={0} max={500} step={10} value={priceRange} onValueChange={setPriceRange} className="my-4" />
              <div className="flex justify-between text-sm text-brand-text/70">
                <span>${priceRange[0]}</span><span>${priceRange[1]}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-3 block">{lang==='ar'?'التقييم':'Rating'}</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 3, 4, 4.5].map(r => (
                  <button key={r} onClick={()=>setMinRating(r)}
                    className={cn('h-9 rounded-lg text-xs font-medium border transition',
                      minRating===r ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white border-brand-primary/10 hover:border-brand-primary/30')}>
                    {r===0 ? (lang==='ar'?'الكل':'Any') : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={()=>setFiltersOpen(true)} className="lg:hidden rounded-full h-10">
              <SlidersHorizontal className="h-4 w-4 me-2"/> {lang==='ar'?'فلاتر':'Filters'}
            </Button>
            <div className="hidden lg:block" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[200px] h-10 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{lang==='ar'?'مميز':'Featured'}</SelectItem>
                <SelectItem value="newest">{lang==='ar'?'الأحدث':'Newest'}</SelectItem>
                <SelectItem value="price-asc">{lang==='ar'?'السعر: منخفض إلى مرتفع':'Price: Low to High'}</SelectItem>
                <SelectItem value="price-desc">{lang==='ar'?'السعر: مرتفع إلى منخفض':'Price: High to Low'}</SelectItem>
                <SelectItem value="rating">{lang==='ar'?'التقييم':'Top rated'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-brand-text/60">{lang==='ar'?'لا توجد منتجات تطابق الفلاتر':'No products match your filters.'}</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={
      <div className="container py-8 md:py-14">
        <div className="mb-8">
          <div className="h-8 w-64 rounded-full bg-brand-bg-alt animate-pulse mb-3" />
          <div className="h-4 w-32 rounded-full bg-brand-bg-alt animate-pulse" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <ProductsInner />
    </Suspense>
  );
}

export default App;
