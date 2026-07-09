'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/store/language';
import { toast } from 'sonner';

export function NewsletterSection() {
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })});
      setSubscribed(true);
      toast.success(lang==='ar' ? 'تم الاشتراك بنجاح، شكراً لك!' : 'Subscribed! Watch your inbox.');
    } catch (e) { toast.error('Something went wrong.'); }
    setLoading(false);
  };

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-brand-royal to-brand-primary p-8 md:p-14 text-center text-white">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full glass-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
              <Mail className="h-3.5 w-3.5" /> Newsletter
            </div>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-balance">{t('sections.newsletter')}</h2>
            <p className="mt-3 text-white/80 text-lg">{t('sections.newsletterSub')}</p>

            {subscribed ? (
              <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/15 backdrop-blur px-6 py-3 text-white">
                <Check className="h-5 w-5" />
                <span className="font-medium">{lang==='ar'?'تم الاشتراك بنجاح':'You\'re on the list.'}</span>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  type="email" required
                  value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={t('sections.newsletterPlaceholder')}
                  className="h-12 rounded-full bg-white/95 border-0 text-brand-dark placeholder:text-brand-text/40 focus-visible:ring-2 focus-visible:ring-white"
                />
                <Button type="submit" disabled={loading}
                  className="h-12 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold shadow-orange">
                  {loading ? '…' : <>{t('sections.newsletterCta')} <Send className="h-4 w-4 ms-1.5"/></>}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
