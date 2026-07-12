'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Truck, Shield, PhoneCall, MapPin, Package, Minus, Plus, Loader2, ShoppingBag, Star, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useOrderForm } from '@/lib/store/order-form';
import { useStorefront } from '@/lib/store/storefront';
import { WILAYAS, getCommunesByWilaya } from '@/lib/algeria-data';
import { formatMoney } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = ['Customer Info', 'Review Order', 'Confirmed'];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^(05|06|07)\d{8}$/.test(form.phone.trim())) {
    errors.phone = 'Enter a valid Algerian number: 05xx, 06xx, or 07xx';
  }
  if (!form.wilaya) errors.wilaya = 'Please select your wilaya';
  if (!form.address.trim()) errors.address = 'Delivery address is required';
  return errors;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

export function OrderFormModal() {
  const { isOpen, product, quantity: initialQty, close } = useOrderForm();
  const settings = useStorefront(s => s.settings);

  const [step, setStep] = useState(0);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', wilaya: '', commune: '', address: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  // Reset when modal opens with a new product
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setQty(initialQty || 1);
      setForm({ name: '', phone: '', wilaya: '', commune: '', address: '' });
      setErrors({});
      setOrderResult(null);
    }
  }, [isOpen, initialQty]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Shipping calculation
  const shippingByWilaya = settings?.shipping_by_wilaya || {};
  const globalShipping = Number(settings?.shipping_price_dz || 400);
  const shippingCost = form.wilaya
    ? (Number(shippingByWilaya[form.wilaya]) || globalShipping)
    : globalShipping;
  const subtotal = Number(product?.price || 0) * qty;
  const total = subtotal + shippingCost;

  const communes = getCommunesByWilaya(form.wilaya);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
    // Reset commune when wilaya changes
    if (key === 'wilaya') setForm(f => ({ ...f, wilaya: val, commune: '' }));
  };

  const handleNext = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(1);
    else {
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`order-field-${firstKey}`)?.focus();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const wilayaObj = WILAYAS.find(w => w.name === form.wilaya);
      const body = {
        items: [{
          id: product.id,
          name_en: product.name_en,
          name_ar: product.name_ar || product.name_en,
          price: product.price,
          qty,
          image: product.images?.[0] || '',
          slug: product.slug,
        }],
        customer: { name: form.name.trim(), phone: form.phone.trim() },
        address: {
          wilaya: form.wilaya,
          wilayaCode: wilayaObj?.code || '',
          municipality: form.commune,
          address: form.address.trim(),
        },
        notes: '',
        subtotal,
        shipping: shippingCost,
        total,
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setOrderResult(data.order);
        setStep(2);
      } else {
        toast.error(data.error || 'Failed to place order. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    close();
  };

  if (!product) return null;
  const name = product.name_en;
  const image = product.images?.[0] || '/placeholder.png';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="order-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            key="order-modal-panel"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-white w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {step === 2 ? '🎉 Order Confirmed!' : 'Quick Order'}
                </h2>
                {step < 2 && (
                  <p className="text-xs text-gray-400 mt-0.5">Cash on Delivery · All 58 Wilayas</p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Step Progress (steps 0 and 1 only) */}
            {step < 2 && (
              <div className="px-5 pt-4 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  {STEPS.slice(0, 2).map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        i < step ? 'bg-green-500 text-white' :
                        i === step ? 'bg-[#0B3C91] text-white' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-[#0B3C91]' : 'text-gray-400'}`}>{s}</span>
                      {i < 1 && <div className={`flex-1 h-0.5 rounded-full ${step > i ? 'bg-[#0B3C91]' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* ── Step 0: Customer Info ── */}
              {step === 0 && (
                <div className="px-5 py-4 space-y-4">
                  {/* Product mini preview */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-1">{name}</p>
                      <p className="text-[#0B3C91] font-bold text-base mt-0.5">{formatMoney(product.price, 'DZD')}</p>
                    </div>
                    {/* Qty stepper */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{qty}</span>
                      <button
                        onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                        className="h-8 w-8 rounded-full bg-[#0B3C91] hover:bg-[#0a2f6e] text-white flex items-center justify-center transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="order-field-name"
                      type="text"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Ahmed Benali"
                      className={`w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C91]/30 transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    <FieldError msg={errors.name} />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="order-field-phone"
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="05xxxxxxxx / 06xxxxxxxx / 07xxxxxxxx"
                      maxLength={10}
                      className={`w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C91]/30 transition ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    <FieldError msg={errors.phone} />
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Wilaya <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="order-field-wilaya"
                      value={form.wilaya}
                      onChange={e => set('wilaya', e.target.value)}
                      className={`w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C91]/30 transition bg-white appearance-none ${errors.wilaya ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">— Select Wilaya —</option>
                      {WILAYAS.map(w => (
                        <option key={w.code} value={w.name}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                    {form.wilaya && (
                      <p className="text-xs text-[#0B3C91] mt-1 font-medium">
                        🚚 Shipping: {formatMoney(shippingCost, 'DZD')}
                      </p>
                    )}
                    <FieldError msg={errors.wilaya} />
                  </div>

                  {/* Commune */}
                  {communes.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                        Commune <span className="text-gray-400">(optional)</span>
                      </label>
                      <select
                        value={form.commune}
                        onChange={e => set('commune', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C91]/30 transition bg-white appearance-none"
                      >
                        <option value="">— Select Commune —</option>
                        {communes.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Address */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="order-field-address"
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      placeholder="Street, neighborhood, building number..."
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C91]/30 transition resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    />
                    <FieldError msg={errors.address} />
                  </div>
                </div>
              )}

              {/* ── Step 1: Review ── */}
              {step === 1 && (
                <div className="px-5 py-4 space-y-4">
                  {/* Product */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Order</p>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{product.brand}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#0B3C91] font-bold">{formatMoney(product.price, 'DZD')}</span>
                          <span className="text-gray-400 text-xs">× {qty}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer info summary */}
                  <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-[#0B3C91] uppercase tracking-wide mb-2">Delivery Details</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <PhoneCall className="w-4 h-4 text-[#0B3C91] shrink-0" />
                      <span className="font-medium">{form.name}</span>
                      <span className="text-gray-400">·</span>
                      <span>{form.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-[#0B3C91] shrink-0 mt-0.5" />
                      <span>
                        {form.commune ? `${form.commune}, ` : ''}{form.wilaya}
                        {form.address && <><br /><span className="text-gray-500 text-xs">{form.address}</span></>}
                      </span>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="divide-y divide-gray-50">
                      <div className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-gray-500">Subtotal ({qty} item{qty > 1 ? 's' : ''})</span>
                        <span className="font-medium">{formatMoney(subtotal, 'DZD')}</span>
                      </div>
                      <div className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-gray-500 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Shipping to {form.wilaya}</span>
                        <span className="font-medium text-orange-600">{formatMoney(shippingCost, 'DZD')}</span>
                      </div>
                      <div className="flex justify-between px-4 py-4 font-bold text-base bg-gray-50">
                        <span>Total</span>
                        <span className="text-[#0B3C91] text-lg">{formatMoney(total, 'DZD')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Truck, text: 'Fast Delivery' },
                      { icon: ShoppingBag, text: 'Pay on Delivery' },
                      { icon: Shield, text: 'Secure Order' },
                      { icon: PhoneCall, text: 'Customer Support' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-xl p-2.5">
                        <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="font-medium">✔ {text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 2: Confirmed ── */}
              {step === 2 && orderResult && (
                <div className="px-5 py-8 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order Placed Successfully!</h3>
                    <p className="text-gray-500 text-sm mt-1">We will call you to confirm your order shortly.</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Order Number</span>
                      <span className="font-mono font-bold text-[#0B3C91]">{orderResult.order_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Total</span>
                      <span className="font-bold text-gray-900">{formatMoney(orderResult.total, 'DZD')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Payment</span>
                      <span className="text-green-600 font-medium text-sm">Cash on Delivery</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Truck, text: 'Fast Delivery' },
                      { icon: ShoppingBag, text: 'Pay on Delivery' },
                      { icon: Shield, text: 'Secure Order' },
                      { icon: PhoneCall, text: '24/7 Support' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 rounded-xl p-2.5">
                        <Icon className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span>✔ {text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-2">
              {step === 0 && (
                <button
                  onClick={handleNext}
                  className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-[#0B3C91] to-[#1a4fa8] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#0B3C91]/30 hover:opacity-95 transition-opacity active:scale-[0.98]"
                >
                  Review Order <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {step === 1 && (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardCheck className="w-5 h-5" />}
                    {loading ? 'Confirming...' : 'Confirm My Order'}
                  </button>
                  <button
                    onClick={() => setStep(0)}
                    className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
                  >
                    ← Edit Info
                  </button>
                </>
              )}
              {step === 2 && (
                <button
                  onClick={handleClose}
                  className="w-full h-13 py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors active:scale-[0.98]"
                >
                  <Package className="w-5 h-5" /> Continue Shopping
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
