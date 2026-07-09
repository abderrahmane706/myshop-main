'use client';
import { use, Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Phone, Home, Truck, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/store/language';
import { toast } from 'sonner';

function OrderContent({ params }) {
  const { id } = use(params);
  const search = useSearchParams();
  const number = search.get('number') || id;
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(number);
    setCopied(true);
    toast.success('Copied');
    setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <div className="container py-14 md:py-20">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="h-24 w-24 rounded-full bg-brand-success/10 grid place-items-center mx-auto mb-6">
          <CheckCircle2 className="h-14 w-14 text-brand-success" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">{t('order.thanks')}</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-lg text-brand-text/70">
          {t('order.placed')}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-white shadow-soft border border-black/5 px-5 py-3">
          <span className="text-xs uppercase tracking-wider text-brand-text/50">{t('order.number')}</span>
          <span className="font-mono font-bold text-brand-primary text-lg tracking-wider">{number}</span>
          <button onClick={copy} aria-label="Copy order number" className="h-8 w-8 grid place-items-center rounded-full hover:bg-brand-bg">
            {copied ? <Check className="h-4 w-4 text-brand-success"/> : <Copy className="h-4 w-4 text-brand-text/60"/>}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-10 grid sm:grid-cols-3 gap-4 text-start">
          <div className="rounded-2xl bg-white border border-black/5 shadow-soft p-5">
            <Phone className="h-6 w-6 text-brand-royal mb-3" />
            <div className="font-semibold text-brand-dark">{lang==='ar'?'سنتصل بك':'We\'ll call'}</div>
            <p className="text-sm text-brand-text/60 mt-1">{t('order.willContact')}</p>
          </div>
          <div className="rounded-2xl bg-white border border-black/5 shadow-soft p-5">
            <Package className="h-6 w-6 text-brand-orange mb-3" />
            <div className="font-semibold text-brand-dark">{lang==='ar'?'يتم التجهيز':'Being prepared'}</div>
            <p className="text-sm text-brand-text/60 mt-1">{lang==='ar'?'فريقنا يجهز طلبك بعناية.':'Our team is carefully preparing your order.'}</p>
          </div>
          <div className="rounded-2xl bg-white border border-black/5 shadow-soft p-5">
            <Truck className="h-6 w-6 text-brand-primary mb-3" />
            <div className="font-semibold text-brand-dark">{lang==='ar'?'التوصيل 24-48س':'Delivery 24-48h'}</div>
            <p className="text-sm text-brand-text/60 mt-1">{lang==='ar'?'ادفع نقداً عند وصول طلبك.':'Pay in cash when your order arrives.'}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/products">
            <Button className="h-12 px-6 rounded-full bg-brand-primary hover:bg-brand-primary-700 text-white font-semibold">
              {t('order.continue')} <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180"/>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="h-12 px-6 rounded-full border-brand-dark/15">
              <Home className="h-4 w-4 me-2"/> {lang==='ar'?'الرئيسية':'Home'}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function App({ params }) {
  return (
    <Suspense fallback={<div className="container py-20 text-center text-brand-text/60">Loading…</div>}>
      <OrderContent params={params} />
    </Suspense>
  );
}

export default App;
