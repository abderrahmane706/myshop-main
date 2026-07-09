'use client';
import Link from 'next/link';
import { Home, Search, ShoppingBag, User, LayoutGrid } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { motion } from 'framer-motion';

export function MobileTabBar() {
  const count = useCart(s => s.count());
  const openCart = useCart(s => s.open);
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutGrid, label: 'Shop', href: '/products' },
    { icon: Search, label: 'Search', href: '/products?focus=search' },
    { icon: ShoppingBag, label: 'Bag', onClick: openCart, badge: count },
    { icon: User, label: 'Me', href: '#' },
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
      <div className="m-3 rounded-2xl bg-white/95 backdrop-blur-xl shadow-soft-lg border border-black/5">
        <div className="grid grid-cols-5">
          {items.map((it, i) => {
            const Ico = it.icon;
            const inner = (
              <div className="relative flex flex-col items-center gap-1 py-2.5">
                <Ico className="h-5 w-5 text-brand-text/70" />
                <span className="text-[10px] text-brand-text/60">{it.label}</span>
                {it.badge > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-1 right-4 h-4 min-w-4 px-1 rounded-full bg-brand-orange text-white text-[9px] font-bold grid place-items-center">
                    {it.badge}
                  </motion.span>
                )}
              </div>
            );
            return it.onClick
              ? <button key={i} onClick={it.onClick}>{inner}</button>
              : <Link key={i} href={it.href}>{inner}</Link>;
          })}
        </div>
      </div>
    </div>
  );
}
