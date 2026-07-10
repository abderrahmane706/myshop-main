'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Loader2, FolderOpen, RefreshCw, GripVertical } from 'lucide-react';
import { adminApi, hasAdminToken } from '@/lib/admin-api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ICONS = ['Sparkles', 'Watch', 'Gem', 'Gift', 'Star', 'Tag', 'Package', 'Heart', 'Crown', 'Zap'];

const EMPTY = { slug: '', name_en: '', name_ar: '', icon: 'Tag', sort_order: 0 };

function slugify(t) {
  return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-');
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = add new, else edit ID
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!hasAdminToken()) { router.replace('/admin'); return; }
    const { ok, data } = await adminApi.getCategories();
    if (ok) setCategories(data.categories || []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const startAdd = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ slug: cat.slug, name_en: cat.name_en, name_ar: cat.name_ar || '', icon: cat.icon || 'Tag', sort_order: cat.sort_order || 0 });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_en || !form.slug) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    const { ok, data } = editingId
      ? await adminApi.updateCategory(editingId, form)
      : await adminApi.createCategory(form);
    if (ok) {
      toast.success(editingId ? 'Category updated' : 'Category created');
      await fetchCategories();
      cancel();
    } else {
      toast.error(data?.error || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setDeleting(id);
    const { ok, data } = await adminApi.deleteCategory(id);
    if (ok) {
      toast.success('Category deleted');
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      toast.error(data?.error || 'Delete failed');
    }
    setDeleting(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-500 text-sm mt-1">{categories.length} categories configured</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchCategories}><RefreshCw className="w-4 h-4" /></Button>
              <Button size="sm" onClick={startAdd} className="bg-gray-900 text-white gap-2">
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Category' : 'New Category'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name (English) *</Label>
                    <Input
                      value={form.name_en}
                      onChange={e => { set('name_en', e.target.value); if (!editingId) set('slug', slugify(e.target.value)); }}
                      placeholder="e.g. Perfumes"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Name (Arabic)</Label>
                    <Input value={form.name_ar} onChange={e => set('name_ar', e.target.value)} placeholder="مثال: العطور" dir="rtl" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Slug *</Label>
                    <Input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="perfumes" required className="mt-1 font-mono text-sm" />
                  </div>
                  <div>
                    <Label>Sort Order</Label>
                    <Input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} min={0} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Icon</Label>
                  <Select value={form.icon} onValueChange={v => set('icon', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ICONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="bg-gray-900 text-white">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-white h-16 rounded-xl animate-pulse border border-gray-100" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-500">No categories yet</h3>
              <p className="text-sm text-gray-400 mt-1">Create your first category to organize products.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">
                      {cat.icon === 'Sparkles' ? '✨' : cat.icon === 'Watch' ? '⌚' : cat.icon === 'Gem' ? '💎' : cat.icon === 'Gift' ? '🎁' : cat.icon === 'Star' ? '⭐' : cat.icon === 'Crown' ? '👑' : '🏷️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{cat.name_en}</div>
                      <div className="text-sm text-gray-400 font-mono">/{cat.slug}</div>
                    </div>
                    {cat.name_ar && <div className="text-sm text-gray-400" dir="rtl">{cat.name_ar}</div>}
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(cat)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name_en)}
                        disabled={deleting === cat.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
