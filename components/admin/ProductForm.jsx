'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Upload, X, GripVertical, Plus,
  Loader2
} from 'lucide-react';
import { adminApi, uploadImageToSupabase } from '@/lib/admin-api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EMPTY_PRODUCT = {
  slug: '', name_en: '', name_ar: '', brand: '', category: 'accessories',
  price: '', compare_at: '', stock: '', sku: '', rating: 5.0, reviews_count: 0,
  description_en: '', description_ar: '', images: [], specs: [], tags: [],
  featured: false, bestseller: false, published: true,
};

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-');
}

export function ProductForm({ initial = null, productId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(initial || EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const fileRef = useRef(null);
  const isEdit = !!productId;

  useEffect(() => {
    adminApi.getCategories().then(({ ok, data }) => {
      if (ok) setCategories(data.categories || []);
    });
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleNameChange = (val) => {
    set('name_en', val);
    if (!isEdit) set('slug', slugify(val));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadImageToSupabase(f)));
      set('images', [...(form.images || []), ...urls]);
      toast.success(`${urls.length} image${urls.length !== 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    }
    setUploading(false);
    e.target.value = '';
  };

    set('images', (form.images || []).filter((_, i) => i !== idx));

  // Drag-and-drop image reorder
  const handleDragStart = (e, idx) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };
  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIdx) { setDragOverIndex(null); return; }
    const imgs = [...(form.images || [])];
    const [moved] = imgs.splice(dragIndex, 1);
    imgs.splice(targetIdx, 0, moved);
    set('images', imgs);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Specs management
  const addSpec = () => set('specs', [...form.specs, { k: '', v: '' }]);
  const updateSpec = (i, field, val) => {
    const specs = [...form.specs];
    specs[i] = { ...specs[i], [field]: val };
    set('specs', specs);
  };
  const removeSpec = (i) => set('specs', form.specs.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slug) { toast.error('Slug is required'); return; }
    if (!form.name_en) { toast.error('Product name is required'); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Valid price is required'); return; }

    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      compare_at: form.compare_at ? Number(form.compare_at) : null,
      stock: Number(form.stock) || 0,
      rating: Number(form.rating) || 5.0,
      reviews_count: Number(form.reviews_count) || 0,
      specs: form.specs.filter(s => s.k && s.v),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
    };

    const { ok, data } = isEdit
      ? await adminApi.updateProduct(productId, payload)
      : await adminApi.createProduct(payload);

    if (ok) {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      router.push('/admin/products');
    } else {
      toast.error(data?.error || 'Save failed');
    }
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <form onSubmit={handleSubmit}>
          {/* Sticky header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.push('/admin/products')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
                {form.slug && <div className="text-xs text-gray-400">/products/{form.slug}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => set('published', !form.published)}>
                {form.published ? '🟢 Live' : '⚪ Draft'}
              </Button>
              <Button type="submit" disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Main fields */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Info */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Product Information</h2>
                <div>
                  <Label>Name (English) *</Label>
                  <Input value={form.name_en} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Nuit Bleue Eau de Parfum" required className="mt-1" />
                </div>
                <div>
                  <Label>Name (Arabic)</Label>
                  <Input value={form.name_ar} onChange={e => set('name_ar', e.target.value)} placeholder="الاسم بالعربية" dir="rtl" className="mt-1" />
                </div>
                <div>
                  <Label>URL Slug *</Label>
                  <Input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="product-url-slug" required className="mt-1 font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Brand *</Label>
                    <Input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Brand name" required className="mt-1" />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. DGM-001" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Description (English) *</Label>
                  <Textarea value={form.description_en} onChange={e => set('description_en', e.target.value)} placeholder="Describe this product..." rows={4} className="mt-1 resize-none" required />
                </div>
                <div>
                  <Label>Description (Arabic)</Label>
                  <Textarea value={form.description_ar} onChange={e => set('description_ar', e.target.value)} placeholder="وصف المنتج..." rows={3} dir="rtl" className="mt-1 resize-none" />
                </div>
              </section>

              {/* Images */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Images</h2>
                  <p className="text-xs text-gray-400">Drag to reorder · First image is the cover</p>
                </div>

                {/* Upload button */}
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600 disabled:opacity-50 mb-4"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5" /> Upload Images (multiple allowed)
                    </span>
                  )}
                </button>

                {/* Image grid */}
                {(form.images || []).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {(form.images || []).map((url, idx) => (
                      <div
                        key={url + idx}
                        draggable
                        onDragStart={e => handleDragStart(e, idx)}
                        onDragOver={e => handleDragOver(e, idx)}
                        onDrop={e => handleDrop(e, idx)}
                        onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                        className={cn(
                          'relative group rounded-xl overflow-hidden aspect-square bg-gray-100 cursor-grab border-2 transition-all',
                          idx === 0 ? 'border-blue-400' : 'border-transparent',
                          dragOverIndex === idx && dragIndex !== idx ? 'border-blue-500 scale-105' : ''
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            COVER
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <GripVertical className="w-4 h-4 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Specs */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Specifications</h2>
                  <button type="button" onClick={addSpec} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add spec
                  </button>
                </div>
                <div className="space-y-2">
                  {form.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={spec.k} onChange={e => updateSpec(i, 'k', e.target.value)} placeholder="Label (e.g. Volume)" className="flex-1" />
                      <Input value={spec.v} onChange={e => updateSpec(i, 'v', e.target.value)} placeholder="Value (e.g. 100ml)" className="flex-1" />
                      <button type="button" onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {!form.specs.length && <p className="text-sm text-gray-400 text-center py-2">No specs added yet.</p>}
                </div>
              </section>
            </div>

            {/* Right: Pricing, Inventory, Flags */}
            <div className="space-y-6">

              {/* Pricing */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Pricing (DZD)</h2>
                <div>
                  <Label>Price *</Label>
                  <Input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" required className="mt-1" />
                </div>
                <div>
                  <Label>Compare-at Price</Label>
                  <Input type="number" min="0" step="0.01" value={form.compare_at || ''} onChange={e => set('compare_at', e.target.value)} placeholder="Original price (crossed out)" className="mt-1" />
                </div>
              </section>

              {/* Inventory */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Inventory</h2>
                <div>
                  <Label>Stock Quantity *</Label>
                  <Input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" required className="mt-1" />
                </div>
              </section>

              {/* Category */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Organization</h2>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.slug} value={c.slug}>{c.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags</Label>
                  <Input
                    value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                    onChange={e => set('tags', e.target.value)}
                    placeholder="bestseller, new-collection, sale"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
                </div>
              </section>

              {/* Flags */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
                <h2 className="font-semibold text-gray-900">Display Flags</h2>
                {[
                  { key: 'featured', label: 'Featured on Homepage' },
                  { key: 'bestseller', label: 'Mark as Bestseller' },
                  { key: 'published', label: 'Published (Live on store)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      'w-10 h-6 rounded-full transition-colors relative shrink-0',
                      form[key] ? 'bg-blue-600' : 'bg-gray-200'
                    )}>
                      <div className={cn(
                        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        form[key] ? 'translate-x-5' : 'translate-x-1'
                      )} />
                      <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="sr-only" />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                  </label>
                ))}
              </section>

              {/* Rating */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Ratings</h2>
                <div>
                  <Label>Rating (1–5)</Label>
                  <Input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Reviews Count</Label>
                  <Input type="number" min="0" value={form.reviews_count} onChange={e => set('reviews_count', e.target.value)} className="mt-1" />
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
