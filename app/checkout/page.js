'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Truck, ShieldCheck, ChevronLeft, Wallet, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/lib/store/cart';
import { useLanguage } from '@/lib/store/language';
import { formatMoney } from '@/lib/utils';
import { toast } from 'sonner';

function App() {
  const { items, subtotal, shipping, total, clear } = useCart();
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    address: '', city: '', country: lang==='ar'?'المغرب':'Morocco', notes: '',
  });

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items, subtotal: subtotal(), shipping: shipping(), total: total(),
          customer: { email: form.email, firstName: form.firstName, lastName: form.lastName, phone: form.phone },
          address: { address: form.address, city: form.city, country: form.country },
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');
      clear();
      router.push(`/order/${data.order.id}?number=${data.order.order_number}`);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold text-brand-dark">{t('cart.empty')}</h1>
        <Link href="/products" className="inline-block mt-6">
          <Button className="rounded-full h-11 px-6 bg-brand-primary hover:bg-brand-primary-700">{t('cart.startShopping')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-14">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-brand-text/60 hover:text-brand-primary mb-6">
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {t('cart.continue')}
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight mb-2">{t('checkout.title')}</h1>
      <p className="text-brand-text/60 mb-10">{lang==='ar' ? 'أكمل طلبك في دقيقتين.' : 'Complete your order in under 2 minutes.'}</p>

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Contact */}
          <section className="bg-white rounded-2xl border border-black/5 shadow-soft p-6 md:p-8">
            <h2 className="text-lg font-semibold text-brand-dark mb-5">{t('checkout.contact')}</h2>
            <div className="space-y-4">
              <div><Label htmlFor="co-email" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.email')}</Label>
                <Input id="co-email" required type="email" value={form.email} onChange={change('email')} className="h-12 rounded-lg"/></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label htmlFor="co-fname" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.firstName')}</Label>
                  <Input id="co-fname" required value={form.firstName} onChange={change('firstName')} className="h-12 rounded-lg"/></div>
                <div><Label htmlFor="co-lname" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.lastName')}</Label>
                  <Input id="co-lname" required value={form.lastName} onChange={change('lastName')} className="h-12 rounded-lg"/></div>
              </div>
              <div><Label htmlFor="co-phone" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.phone')}</Label>
                <Input id="co-phone" required type="tel" value={form.phone} onChange={change('phone')} placeholder="+212 ..." className="h-12 rounded-lg"/></div>
            </div>
          </section>

          {/* Shipping */}
          <section className="bg-white rounded-2xl border border-black/5 shadow-soft p-6 md:p-8">
            <h2 className="text-lg font-semibold text-brand-dark mb-5">{t('checkout.shipping')}</h2>
            <div className="space-y-4">
              <div><Label htmlFor="co-address" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.address')}</Label>
                <Input id="co-address" required value={form.address} onChange={change('address')} className="h-12 rounded-lg"/></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label htmlFor="co-city" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.city')}</Label>
                  <Input id="co-city" required value={form.city} onChange={change('city')} className="h-12 rounded-lg"/></div>
                <div><Label htmlFor="co-country" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.country')}</Label>
                  <Input id="co-country" required value={form.country} onChange={change('country')} className="h-12 rounded-lg"/></div>
              </div>
              <div><Label htmlFor="co-notes" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-text/60">{t('checkout.notes')}</Label>
                <Textarea id="co-notes" value={form.notes} onChange={change('notes')} className="rounded-lg" rows={3}/></div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-2xl border border-black/5 shadow-soft p-6 md:p-8">
            <h2 className="text-lg font-semibold text-brand-dark mb-5">{t('checkout.payment')}</h2>
            <div className="rounded-xl border-2 border-brand-primary/60 bg-brand-royal-50/50 p-5 flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-brand-primary grid place-items-center shrink-0">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-brand-dark">{t('checkout.codLabel')}</span>
                  <span className="h-5 px-2 rounded-full bg-brand-success/15 text-brand-success text-[10px] font-bold uppercase tracking-wider grid place-items-center">Active</span>
                </div>
                <p className="text-sm text-brand-text/60 mt-1">{t('checkout.codDesc')}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-brand-text/60">
              <Lock className="h-3.5 w-3.5" /> {lang==='ar'?'معلوماتك محمية ومشفرة.':'Your information is encrypted and secure.'}
            </div>
          </section>
        </motion.div>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl border border-black/5 shadow-soft p-6">
            <h2 className="font-semibold text-brand-dark mb-5">{t('checkout.summary')}</h2>
            <ul className="space-y-3 max-h-[300px] overflow-y-auto pe-1">
              {items.map(i => (
                <li key={i.id} className="flex gap-3 items-center">
                  <div className="relative h-16 w-14 rounded-lg overflow-hidden bg-brand-bg shrink-0">
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-dark text-white text-[10px] font-bold grid place-items-center">{i.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-brand-dark line-clamp-1">{lang==='ar'?i.name_ar:i.name_en}</div>
                    <div className="text-xs text-brand-text/60">Qty {i.qty}</div>
                  </div>
                  <div className="text-sm font-semibold text-brand-primary">{formatMoney(i.price * i.qty)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span className="text-brand-text/60">{t('cart.subtotal')}</span><span className="font-medium">{formatMoney(subtotal())}</span></div>
              <div className="flex justify-between"><span className="text-brand-text/60">{t('cart.shipping')}</span><span className="font-medium">{shipping() === 0 ? (lang==='ar'?'مجاناً':'Free') : formatMoney(shipping())}</span></div>
              <div className="flex justify-between items-baseline pt-3 border-t">
                <span className="font-semibold text-brand-dark">{t('cart.total')}</span>
                <span className="text-2xl font-bold text-brand-primary">{formatMoney(total())}</span>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="mt-5 w-full h-12 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-base shadow-orange">
              {loading ? t('checkout.placing') : t('checkout.place')}
            </Button>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-brand-text/60">
              <div className="flex flex-col items-center gap-1"><Truck className="h-4 w-4 text-brand-royal"/>{lang==='ar'?'توصيل سريع':'Fast'}</div>
              <div className="flex flex-col items-center gap-1"><ShieldCheck className="h-4 w-4 text-brand-success"/>{lang==='ar'?'آمن':'Secure'}</div>
              <div className="flex flex-col items-center gap-1"><CreditCard className="h-4 w-4 text-brand-primary"/>{lang==='ar'?'الدفع عند الاستلام':'COD'}</div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default App;
