'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Plus, Star } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useLanguage } from '@/lib/store/language';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn, formatMoney } from '@/lib/utils';

export function ProductCard({ product, index = 0, className }) {
  const add = useCart(s => s.add);
  const lang = useLanguage(s => s.lang);
  const t = useLanguage(s => s.t);

  const name = lang === 'ar' ? product.name_ar : product.name_en;
  const discount = product.compare_at ? Math.round(((product.compare_at - product.price) / product.compare_at) * 100) : 0;

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    add(product, 1);
    toast.success(lang==='ar' ? 'تمت الإضافة إلى السلة' : 'Added to your bag', {
      description: name,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn('group relative', className)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-bg to-brand-bg-alt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images?.[0]}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge className="bg-brand-orange hover:bg-brand-orange-hover text-white border-0 rounded-md text-[10px] font-bold px-2 shadow-orange">
                -{discount}%
              </Badge>
            )}
            {product.tags?.includes('new-collection') && (
              <Badge className="bg-brand-dark hover:bg-brand-dark text-white border-0 rounded-md text-[10px] font-bold px-2">
                {t('common.new')}
              </Badge>
            )}
            {product.bestseller && (
              <Badge className="bg-white/95 backdrop-blur text-brand-primary border-0 rounded-md text-[10px] font-bold px-2 shadow-soft">
                {lang==='ar'?'الأكثر مبيعاً':'Bestseller'}
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <button className="absolute top-3 end-3 h-9 w-9 grid place-items-center rounded-full bg-white/90 backdrop-blur hover:bg-white transition shadow-soft opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
            <Heart className="h-4 w-4 text-brand-text/70" />
          </button>

          {/* Add-to-cart floating */}
          <button
            onClick={handleAdd}
            className="absolute bottom-3 end-3 h-11 pe-4 ps-3 rounded-full bg-brand-dark text-white text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 shadow-soft-lg hover:bg-brand-orange">
            <Plus className="h-4 w-4" />
            {t('product.addToCart')}
          </button>
        </div>

        <div className="pt-4 space-y-1.5">
          <div className="flex items-center gap-1 text-xs text-brand-text/50">
            <span className="uppercase tracking-wider">{product.brand}</span>
          </div>
          <h3 className="font-medium text-brand-dark text-[15px] line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
            <span className="text-brand-text font-medium">{product.rating}</span>
            <span className="text-brand-text/40">({product.reviews_count})</span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold text-brand-primary">{formatMoney(product.price)}</span>
            {product.compare_at && (
              <span className="text-sm text-brand-text/40 line-through">{formatMoney(product.compare_at)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
