'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Search, Edit, Trash2, Copy, Package, RefreshCw
} from 'lucide-react';
import { adminApi, hasAdminToken } from '@/lib/admin-api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMoney, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const fetch = useCallback(async () => {
    if (!hasAdminToken()) { router.replace('/admin'); return; }
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      adminApi.getProducts(),
      adminApi.getCategories(),
    ]);
    if (prodRes.ok) setProducts(prodRes.data.items || []);
    if (catRes.ok) setCategories(catRes.data.categories || []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const { ok, data } = await adminApi.deleteProduct(id);
    if (ok) {
      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      toast.error(data?.error || 'Failed to delete');
    }
    setDeleting(null);
  };

  const handleDuplicate = async (product) => {
    const slug = product.slug + '-copy-' + Date.now().toString(36);
    const { ok, data } = await adminApi.createProduct({
      ...product,
      id: undefined,
      slug,
      name_en: product.name_en + ' (Copy)',
      published: false,
      created_at: undefined,
      updated_at: undefined,
    });
    if (ok) {
      toast.success('Product duplicated (saved as draft)');
      setProducts(prev => [data.product, ...prev]);
    } else {
      toast.error(data?.error || 'Failed to duplicate');
    }
  };

  const handleTogglePublish = async (product) => {
    const { ok } = await adminApi.updateProduct(product.id, { published: !product.published });
    if (ok) {
      toast.success(product.published ? 'Product unpublished' : 'Product published');
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, published: !p.published } : p));
    }
  };

  const filtered = products.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !search || p.name_en?.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s);
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500 text-sm mt-1">{products.length} total · {products.filter(p => p.published).length} published</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetch} className="gap-2">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Link href="/admin/products/new">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white gap-2">
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-500">No products found</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                {search ? 'Try adjusting your search.' : 'Add your first product to get started.'}
              </p>
              {!search && (
                <Link href="/admin/products/new">
                  <Button size="sm" className="bg-gray-900 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Desktop table header */}
              <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span className="w-14">Image</span>
                <span>Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Stock</span>
                <span className="text-center">Status</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-y divide-gray-50">
                {filtered.map(product => (
                  <div key={product.id} className="flex sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors flex-wrap">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">{product.name_en}</span>
                        {product.featured && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">FEATURED</span>}
                        {product.bestseller && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">BESTSELLER</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span>{product.brand}</span>
                        <span>·</span>
                        <span>{product.category}</span>
                        {product.sku && <><span>·</span><span>SKU: {product.sku}</span></>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right sm:text-center">
                      <div className="text-sm font-semibold text-gray-900">{formatMoney(product.price, 'DZD')}</div>
                      {product.compare_at && (
                        <div className="text-xs text-gray-400 line-through">{formatMoney(product.compare_at, 'DZD')}</div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="text-center">
                      <span className={cn(
                        'text-xs font-semibold px-2 py-1 rounded-full',
                        product.stock === 0 ? 'bg-red-100 text-red-600' :
                          product.stock <= 5 ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                      )}>
                        {product.stock === 0 ? 'Out' : product.stock}
                        {product.stock > 0 && product.stock <= 5 && ' ⚠️'}
                      </span>
                    </div>

                    {/* Published */}
                    <div className="text-center">
                      <button onClick={() => handleTogglePublish(product)} title={product.published ? 'Click to unpublish' : 'Click to publish'}>
                        <span className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full cursor-pointer',
                          product.published ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        )}>
                          {product.published ? 'Live' : 'Draft'}
                        </span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDuplicate(product)}
                        className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name_en)}
                        disabled={deleting === product.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === product.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
