'use client';
import Link from 'next/link';
import { useLanguage } from '@/lib/store/language';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { useStorefront } from '@/lib/store/storefront';

export function Footer() {
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  const settings = useStorefront(s => s.settings) || {};
  const storeName = settings.store_name || 'Dar el Ghourabaa Market';

  return (
    <footer className="bg-brand-dark text-white/85 mt-16">
      <div className="container py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-brand-gradient grid place-items-center">
                <span className="text-white font-bold">DG</span>
              </div>
              <div className="leading-tight">
                <div className="text-white font-semibold text-lg">{storeName.replace(' Market', '')}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-brand-orange">Market</div>
              </div>
            </div>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">{t('footer.tagline')}</p>
            <div className="mt-6 flex items-center gap-2">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 grid place-items-center rounded-full bg-white/5 hover:bg-brand-orange hover:text-white transition">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('footer.shop')}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/products?category=perfumes" className="hover:text-brand-orange">{lang==='ar'?'العطور':'Perfumes'}</Link></li>
              <li><Link href="/products?category=watches" className="hover:text-brand-orange">{lang==='ar'?'الساعات':'Watches'}</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-brand-orange">{lang==='ar'?'الإكسسوارات':'Accessories'}</Link></li>
              <li><Link href="/products?category=gift-sets" className="hover:text-brand-orange">{lang==='ar'?'أطقم الهدايا':'Gift Sets'}</Link></li>
              <li><Link href="/products?category=sale" className="hover:text-brand-orange">{lang==='ar'?'تخفيضات':'Sale'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('footer.help')}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="#" className="hover:text-brand-orange">{lang==='ar'?'الشحن':'Shipping'}</Link></li>
              <li><Link href="#" className="hover:text-brand-orange">{lang==='ar'?'الإرجاع':'Returns'}</Link></li>
              <li><Link href="#" className="hover:text-brand-orange">{lang==='ar'?'تتبع الطلب':'Track order'}</Link></li>
              <li><Link href="#" className="hover:text-brand-orange">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('footer.company')}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="#" className="hover:text-brand-orange">{lang==='ar'?'من نحن':'About'}</Link></li>
              <li><Link href="#" className="hover:text-brand-orange">{lang==='ar'?'اتصل بنا':'Contact'}</Link></li>
              <li><Link href="#" className="hover:text-brand-orange">{lang==='ar'?'المدونة':'Blog'}</Link></li>
              <li><Link href="#" className="hover:text-brand-orange">{lang==='ar'?'الوظائف':'Careers'}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {storeName}. {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white">{lang==='ar'?'الخصوصية':'Privacy'}</Link>
            <Link href="#" className="hover:text-white">{lang==='ar'?'الشروط':'Terms'}</Link>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-success animate-pulse"/> Online
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
