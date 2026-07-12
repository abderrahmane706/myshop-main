'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Save, RefreshCw, Truck, Search, RotateCcw } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { hasAdminToken } from '@/lib/admin-api';
import { WILAYAS } from '@/lib/algeria-data';
import { toast } from 'sonner';

const DEFAULT_SHIPPING = 400;

function ShippingContent() {
  const router = useRouter();
  const [prices, setPrices] = useState({});
  const [globalPrice, setGlobalPrice] = useState(DEFAULT_SHIPPING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : '';

  const fetchShipping = useCallback(async () => {
    if (!hasAdminToken()) { router.replace('/admin'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shipping', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.shipping) setPrices(data.shipping);
    } catch { /* ignore */ }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchShipping(); }, [fetchShipping]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save per-wilaya prices
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(prices),
      });
      // Save global default
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shipping_price_dz: globalPrice }),
      });
      if (res.ok) toast.success('Shipping prices saved successfully!');
      else toast.error('Failed to save shipping prices');
    } catch {
      toast.error('Network error');
    }
    setSaving(false);
  };

  const setPrice = (wilayaName, val) => {
    setPrices(p => ({ ...p, [wilayaName]: val === '' ? undefined : Number(val) }));
  };

  const resetWilaya = (wilayaName) => {
    setPrices(p => {
      const next = { ...p };
      delete next[wilayaName];
      return next;
    });
  };

  const filteredWilayas = WILAYAS.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.includes(search)
  );

  const customCount = Object.keys(prices).filter(k => prices[k] !== undefined).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#0B3C91]" /> Shipping Prices
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Set delivery cost per wilaya. {customCount} custom price{customCount !== 1 ? 's' : ''} configured.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchShipping} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 bg-[#0B3C91] hover:bg-[#0a2f6e] text-white">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </div>

          {/* Global default */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#0B3C91]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Default Shipping Price</p>
                <p className="text-xs text-gray-400">Applied to any wilaya without a custom price</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Input
                type="number"
                min="0"
                value={globalPrice}
                onChange={e => setGlobalPrice(Number(e.target.value))}
                className="max-w-[180px] text-base font-semibold"
              />
              <span className="text-sm text-gray-500 font-medium">DZD</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search wilaya by name or code..."
              className="pl-9"
            />
          </div>

          {/* Per-wilaya grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWilayas.map(w => {
                const customPrice = prices[w.name];
                const hasCustom = customPrice !== undefined;
                return (
                  <div
                    key={w.code}
                    className={`bg-white rounded-xl border p-4 transition ${hasCustom ? 'border-[#0B3C91]/30 shadow-sm' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-gray-400 font-mono">{w.code}</span>
                        <p className="font-semibold text-sm text-gray-900">{w.name}</p>
                      </div>
                      {hasCustom && (
                        <button
                          onClick={() => resetWilaya(w.name)}
                          title="Reset to default"
                          className="text-gray-300 hover:text-red-400 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder={String(globalPrice)}
                        value={hasCustom ? customPrice : ''}
                        onChange={e => setPrice(w.name, e.target.value)}
                        className="h-8 text-sm"
                      />
                      <span className="text-xs text-gray-400 shrink-0">DZD</span>
                    </div>
                    {!hasCustom && (
                      <p className="text-xs text-gray-400 mt-1">Default: {globalPrice} DZD</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShippingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    }>
      <ShippingContent />
    </Suspense>
  );
}
