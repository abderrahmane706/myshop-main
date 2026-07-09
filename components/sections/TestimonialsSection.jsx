'use client';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/lib/store/language';

const TESTIMONIALS = [
  { name_en: 'Sarah A.', name_ar: 'سارة أ.', role_en: 'Verified buyer', role_ar: 'مشترية موثقة', rating: 5,
    quote_en: 'The Nuit Bleue perfume is exceptional. Longevity is insane and the bottle looks like it costs 3x the price.',
    quote_ar: 'عطر نويت بلو استثنائي. ثباته مذهل والزجاجة تبدو أغلى ثلاث مرات من السعر.'},
  { name_en: 'Youssef B.', name_ar: 'يوسف ب.', role_en: 'Verified buyer', role_ar: 'مشتري موثق', rating: 5,
    quote_en: 'The Aurum Chronograph is stunning. Feels premium, arrived in 2 days, cash on delivery worked perfectly.',
    quote_ar: 'ساعة أوروم رائعة. تشعر بالفخامة، وصلت في يومين، والدفع عند الاستلام تم بسلاسة.'},
  { name_en: 'Meryem K.', name_ar: 'مريم ك.', role_en: 'Verified buyer', role_ar: 'مشترية موثقة', rating: 5,
    quote_en: 'Bought the Noir gift set for my brother. Packaging alone made me want one for myself. Incredible.',
    quote_ar: 'اشتريت طقم هدايا نوار لأخي. التغليف وحده جعلني أريد واحدًا لنفسي. مدهش.'},
];

export function TestimonialsSection() {
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);

  return (
    <section className="py-20 md:py-28 bg-brand-dark text-white overflow-hidden">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
            {t('sections.testimonials')}
          </motion.h2>
          <p className="mt-4 text-white/60 text-lg">{t('sections.testimonialsSub')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative rounded-3xl bg-white/5 backdrop-blur border border-white/10 p-8">
              <Quote className="h-8 w-8 text-brand-orange/40 mb-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-brand-orange text-brand-orange" />
                ))}
              </div>
              <p className="text-white/90 text-[17px] leading-relaxed">“{lang==='ar'?t.quote_ar:t.quote_en}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-gradient grid place-items-center font-bold">
                  {(lang==='ar'?t.name_ar:t.name_en).charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{lang==='ar'?t.name_ar:t.name_en}</div>
                  <div className="text-xs text-white/50">{lang==='ar'?t.role_ar:t.role_en}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
