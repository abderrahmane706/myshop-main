'use client';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag, Truck, ShieldCheck, Ticket } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useLanguage } from '@/lib/store/language';
import { AnimatePresence, motion } from 'framer-motion';
import { formatMoney } from '@/lib/utils';
import { useState } from 'react';

export function CartDrawer() {
  const { isOpen, close, items, updateQty, remove, subtotal, shipping, total } = useCart();
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const [coupon, setCoupon] = useState('');

  const sub = subtotal(); const ship = shipping(); const tot = total();

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent side={lang==='ar' ? 'left' : 'right'} className="w-full sm:max-w-md p-0 flex flex-col bg-white">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="flex items-center gap-2 text-brand-dark">
            <ShoppingBag className="h-5 w-5" />
            {t('cart.title')}
            {items.length > 0 && <span className="text-sm font-normal text-brand-text/50">· {items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-brand-bg grid place-items-center mb-5">
              <ShoppingBag className="h-9 w-9 text-brand-text/30" />
            </div>
            <h3 className="font-semibold text-lg text-brand-dark">{t('cart.empty')}</h3>
            <p className="text-sm text-brand-text/50 mt-1 mb-6">{t('cart.emptySub')}</p>
            <Button onClick={close} className="bg-brand-primary hover:bg-brand-primary-700 rounded-full h-11 px-6">
              {t('cart.startShopping')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y">
                <AnimatePresence>
                {items.map(i => (
                  <motion.li key={i.id}
                    layout
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="flex gap-4 p-5">
                    <div className="h-24 w-20 rounded-lg overflow-hidden bg-brand-bg shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <Link href={`/products/${i.slug}`} onClick={close} className="text-sm font-medium text-brand-dark hover:text-brand-primary line-clamp-2">
                          {lang==='ar' ? i.name_ar : i.name_en}
                        </Link>
                        <button onClick={() => remove(i.id)} className="text-brand-text/40 hover:text-brand-error transition shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-brand-bg-alt bg-brand-bg">
                          <button onClick={() => updateQty(i.id, i.qty - 1)} className="h-8 w-8 grid place-items-center hover:text-brand-primary">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                          <button onClick={() => updateQty(i.id, i.qty + 1)} className="h-8 w-8 grid place-items-center hover:text-brand-primary">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-brand-primary">{formatMoney(i.price * i.qty)}</div>
                          {i.compare_at && (
                            <div className="text-xs text-brand-text/40 line-through">{formatMoney(i.compare_at * i.qty)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
                </AnimatePresence>
              </ul>
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 rounded-xl bg-brand-bg p-2">
                  <Ticket className="h-4 w-4 ms-2 text-brand-royal shrink-0" />
                  <Input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder={t('cart.coupon')} className="border-0 bg-transparent focus-visible:ring-0 h-9 text-sm" />
                  <Button size="sm" variant="secondary" className="h-9 rounded-lg bg-white hover:bg-white/80">{t('cart.apply')}</Button>
                </div>
              </div>
              <div className="px-5 pb-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-brand-text/70 bg-brand-bg rounded-lg p-3">
                  <Truck className="h-4 w-4 text-brand-royal" />
                  <span>{t('product.free_shipping')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text/70 bg-brand-bg rounded-lg p-3">
                  <ShieldCheck className="h-4 w-4 text-brand-success" />
                  <span>{t('product.returns')}</span>
                </div>
              </div>
            </div>

            <div className="border-t p-5 space-y-3 bg-white">
              <div className="flex justify-between text-sm text-brand-text/70">
                <span>{t('cart.subtotal')}</span>
                <span className="font-medium text-brand-dark">{formatMoney(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-text/70">
                <span>{t('cart.shipping')}</span>
                <span className="font-medium text-brand-dark">{ship === 0 ? (lang==='ar'?'مجاناً':'Free') : formatMoney(ship)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t">
                <span className="font-semibold text-brand-dark">{t('cart.total')}</span>
                <span className="text-2xl font-bold text-brand-primary">{formatMoney(tot)}</span>
              </div>
              <Link href="/checkout" onClick={close}>
                <Button className="w-full h-12 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-base font-semibold shadow-orange">
                  {t('cart.checkout')}
                </Button>
              </Link>
              <button onClick={close} className="w-full text-center text-sm text-brand-text/60 hover:text-brand-primary py-1">
                {t('cart.continue')}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
