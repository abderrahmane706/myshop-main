'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Package,
  Phone,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  MapPin,
  User,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/lib/store/cart';
import { useLanguage } from '@/lib/store/language';
import { formatMoney } from '@/lib/utils';
import { WILAYAS } from '@/lib/constants/wilayas';

export default function CheckoutPage() {
  const cart = useCart();
  const t = useLanguage(s => s.t);
  const lang = useLanguage(s => s.lang);
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    wilaya: '',
    municipality: '',
    address: '',
    notes: ''
  });

  useEffect(() => setMounted(true), []);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = lang === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required';
    
    // Basic phone validation for Algeria (starts with 0, 10 digits)
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    if (!form.phone.trim()) {
      newErrors.phone = lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = lang === 'ar' ? 'رقم الهاتف غير صالح (مثال: 0550123456)' : 'Invalid phone number (e.g. 0550123456)';
    }
    
    if (!form.wilaya) newErrors.wilaya = lang === 'ar' ? 'الولاية مطلوبة' : 'Province is required';
    if (!form.address.trim()) newErrors.address = lang === 'ar' ? 'عنوان التوصيل مطلوب' : 'Delivery address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    try {
      const selectedWilaya = WILAYAS.find(w => w.code === form.wilaya);
      
      const payload = {
        items: cart.items,
        customer: {
          name: form.name,
          phone: form.phone,
        },
        address: {
          wilaya: selectedWilaya ? (lang === 'ar' ? selectedWilaya.name_ar : selectedWilaya.name_en) : form.wilaya,
          wilayaCode: form.wilaya,
          municipality: form.municipality,
          address: form.address,
        },
        notes: form.notes,
        subtotal: cart.subtotal(),
        shipping: cart.shipping(),
        total: cart.total(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.ok) {
        setSuccess({
          orderNumber: data.order.order_number,
          total: data.order.total
        });
        cart.clear();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrors({ submit: data.error || (lang === 'ar' ? 'حدث خطأ' : 'Something went wrong') });
      }
    } catch (err) {
      setErrors({ submit: lang === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error' });
    }
    setLoading(false);
  };

  const change = (field) => (e) => {
    setForm({ ...form, [field]: e.target ? e.target.value : e });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div className="container py-16 md:py-24 min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="max-w-md w-full bg-white rounded-3xl border border-black/5 shadow-soft-xl p-8 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-brand-success/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-brand-success" />
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            {lang === 'ar' ? '🎉 شكراً لك!' : '🎉 Thank you!'}
          </h1>
          <p className="text-brand-text/70 mb-6 text-lg">
            {lang === 'ar' 
              ? 'تم استلام طلبك بنجاح. سيقوم فريقنا بالاتصال بك قريباً لتأكيد الطلب.' 
              : 'Your order has been received successfully. Our team will contact you shortly to confirm your order.'}
          </p>
          
          <div className="bg-brand-bg rounded-2xl p-5 mb-8 text-left text-sm space-y-3">
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-brand-text/60">{lang === 'ar' ? 'رقم الطلب' : 'Order Reference'}</span>
              <span className="font-bold text-brand-dark">{success.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-brand-text/60">{lang === 'ar' ? 'المجموع' : 'Total'}</span>
              <span className="font-bold text-brand-primary">{formatMoney(success.total, 'DZD')}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-brand-text/60 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-orange" />
                {lang === 'ar' ? 'وقت التأكيد المتوقع' : 'Expected confirmation'}
              </span>
              <span className="font-medium text-brand-dark text-right">
                {lang === 'ar' ? 'خلال 30-60 دقيقة' : '30-60 mins'}
              </span>
            </div>
          </div>
          
          <Link href="/products" className="block">
            <Button className="w-full h-14 rounded-full bg-brand-dark hover:bg-brand-dark-2 text-white font-semibold text-lg">
              {lang === 'ar' ? 'مواصلة التسوق' : 'Continue Shopping'}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="w-24 h-24 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-brand-text/40" />
        </div>
        <h1 className="text-3xl font-bold text-brand-dark mb-4">{t('cart.empty')}</h1>
        <p className="text-brand-text/60 mb-8 max-w-md mx-auto">{t('cart.emptySub')}</p>
        <Link href="/products">
          <Button className="h-12 px-8 rounded-full bg-brand-primary text-white font-semibold">
            {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <div className="container py-10 md:py-16 max-w-6xl">
        {/* Header / Trust Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-black/5 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">
            {lang === 'ar' ? 'تأكيد الطلب' : 'Complete Your Order'}
          </h1>
          <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-brand-text/70">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-success" />
              <span>{lang === 'ar' ? 'تسوق آمن' : 'Secure Checkout'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-primary" />
              <span>{lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{errors.submit}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_420px] gap-8 md:gap-12 items-start">
          {/* Left Column: Lead Form */}
          <form onSubmit={submit} className="space-y-8">
            
            {/* 1. Contact Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-primary" />
                </div>
                <h2 className="text-xl font-bold text-brand-dark">
                  {lang === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="co-name" className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-2 block">
                    {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                  </Label>
                  <Input 
                    id="co-name"
                    value={form.name} 
                    onChange={change('name')} 
                    className={`h-14 rounded-xl text-base ${errors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="co-phone" className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-2 block">
                    {lang === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                  </Label>
                  <Input 
                    id="co-phone"
                    type="tel"
                    dir="ltr"
                    value={form.phone} 
                    onChange={change('phone')} 
                    className={`h-14 rounded-xl text-base text-left ${errors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    placeholder="05..."
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* 2. Delivery Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                </div>
                <h2 className="text-xl font-bold text-brand-dark">
                  {lang === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                </h2>
              </div>
              
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-2 block">
                      {lang === 'ar' ? 'الولاية *' : 'Province (Wilaya) *'}
                    </Label>
                    <Select value={form.wilaya} onValueChange={(val) => change('wilaya')(val)} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <SelectTrigger className={`h-14 rounded-xl text-base ${errors.wilaya ? 'border-red-400 focus-visible:ring-red-400' : ''}`}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الولاية' : 'Select province'} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {WILAYAS.map(w => (
                          <SelectItem key={w.code} value={w.code}>
                            {w.code} - {lang === 'ar' ? w.name_ar : w.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.wilaya && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.wilaya}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="co-municipality" className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-2 block">
                      {lang === 'ar' ? 'البلدية (اختياري)' : 'Municipality (Optional)'}
                    </Label>
                    <Input 
                      id="co-municipality"
                      value={form.municipality} 
                      onChange={change('municipality')} 
                      className="h-14 rounded-xl text-base"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="co-address" className="text-xs font-semibold uppercase tracking-wider text-brand-text/60 mb-2 block">
                    {lang === 'ar' ? 'العنوان الكامل *' : 'Full Address *'}
                  </Label>
                  <Input 
                    id="co-address"
                    value={form.address} 
                    onChange={change('address')} 
                    className={`h-14 rounded-xl text-base ${errors.address ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    placeholder={lang === 'ar' ? 'اسم الشارع، رقم العمارة، الخ...' : 'Street name, building number, etc...'}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* 3. Additional Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-royal/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-brand-royal" />
                </div>
                <h2 className="text-xl font-bold text-brand-dark">
                  {lang === 'ar' ? 'ملاحظات الطلب (اختياري)' : 'Order Notes (Optional)'}
                </h2>
              </div>
              
              <Textarea 
                value={form.notes} 
                onChange={change('notes')} 
                className="min-h-[100px] rounded-xl text-base resize-y"
                placeholder={lang === 'ar' ? 'ملاحظات خاصة بتوصيل طلبك...' : 'Special notes for delivery...'}
              />
            </div>
            
            {/* Mobile submit button (hidden on desktop, shows at bottom on mobile) */}
            <div className="lg:hidden mt-8">
              <SubmitButton loading={loading} lang={lang} />
            </div>

          </form>

          {/* Right Column: Order Summary & Trust */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft-lg border border-brand-primary/10">
              <h2 className="text-xl font-bold text-brand-dark mb-6">
                {lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.selectedColor || ''}`} className="flex gap-4">
                    <div className="w-20 h-20 bg-brand-bg rounded-xl overflow-hidden shrink-0 border border-black/5 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-brand-dark text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-semibold text-brand-dark text-sm line-clamp-2">
                        {lang === 'ar' ? item.name_ar : item.name_en}
                      </div>
                      <div className="text-xs text-brand-text/50 mt-1 uppercase tracking-wider">{item.brand}</div>
                      <div className="text-brand-primary font-bold text-sm mt-1">
                        {formatMoney(item.price * item.qty, 'DZD')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-black/5 space-y-3 text-sm">
                <div className="flex justify-between text-brand-text/70">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-medium text-brand-dark">{formatMoney(cart.subtotal(), 'DZD')}</span>
                </div>
                <div className="flex justify-between text-brand-text/70">
                  <span>{t('cart.shipping')}</span>
                  <span className="font-medium text-brand-success">
                    {cart.shipping() === 0 
                      ? (lang === 'ar' ? 'مجانًا' : 'Free') 
                      : formatMoney(cart.shipping(), 'DZD')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                <span className="text-lg font-bold text-brand-dark">{t('cart.total')}</span>
                <span className="text-2xl font-black text-brand-primary">
                  {formatMoney(cart.total(), 'DZD')}
                </span>
              </div>

              <div className="hidden lg:block mt-8">
                <SubmitButton loading={loading} lang={lang} onClick={submit} />
              </div>
            </div>

            {/* Trust Elements */}
            <div className="bg-brand-dark rounded-3xl p-6 text-white">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-white/50">
                {lang === 'ar' ? 'لماذا تشتري منا؟' : 'Why buy from us?'}
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: Phone, text: lang === 'ar' ? 'تأكيد سريع عبر الهاتف' : 'Fast confirmation by phone' },
                  { icon: CreditCard, text: lang === 'ar' ? 'الدفع عند الاستلام' : 'Pay in cash on delivery' },
                  { icon: Truck, text: lang === 'ar' ? 'توصيل سريع ومضمون' : 'Fast & secure shipping' },
                  { icon: ShieldCheck, text: lang === 'ar' ? 'منتجات أصلية وعالية الجودة' : 'Premium quality products' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-brand-orange" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, lang, onClick }) {
  return (
    <Button 
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={loading} 
      className="w-full h-16 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-lg shadow-orange transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden"
    >
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <span className="animate-pulse">{lang === 'ar' ? 'جاري تأكيد الطلب...' : 'Processing...'}</span>
        ) : (
          <>
            {lang === 'ar' ? 'تأكيد الطلب الآن' : 'Place My Order'}
            <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </>
        )}
      </span>
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
    </Button>
  );
}
