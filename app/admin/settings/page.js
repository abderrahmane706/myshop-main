'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Store, Phone, Truck, Instagram } from 'lucide-react';
import { adminApi, hasAdminToken } from '@/lib/admin-api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SETTINGS_SCHEMA = [
  {
    section: 'Store Identity',
    icon: Store,
    fields: [
      { key: 'store_name', label: 'Store Name', placeholder: 'Dar el Ghourabaa Market' },
    ],
  },
  {
    section: 'Contact Information',
    icon: Phone,
    fields: [
      { key: 'contact_phone', label: 'Phone / WhatsApp', placeholder: '+213xxxxxxxxx' },
      { key: 'contact_email', label: 'Email', placeholder: 'contact@store.com', type: 'email' },
      { key: 'contact_address', label: 'Address', placeholder: 'City, Algeria' },
    ],
  },
  {
    section: 'Shipping',
    icon: Truck,
    fields: [
      { key: 'shipping_price_dz', label: 'Shipping Price (DZD)', placeholder: '400', type: 'number' },
      { key: 'free_shipping_threshold', label: 'Free Shipping From (DZD, 0 = disabled)', placeholder: '0', type: 'number' },
    ],
  },
  {
    section: 'Social Links',
    icon: Instagram,
    fields: [
      { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourpage' },
      { key: 'social_facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
      { key: 'social_whatsapp', label: 'WhatsApp Number', placeholder: '+213xxxxxxxxx' },
    ],
  },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!hasAdminToken()) { router.replace('/admin'); return; }
    const { ok, data } = await adminApi.getSettings();
    if (ok) setSettings(data.settings || {});
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const get = (key) => {
    const v = settings[key];
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    return String(v);
  };

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    // Convert all values to their Supabase JSONB format (numbers as numbers, strings as strings)
    const payload = {};
    SETTINGS_SCHEMA.forEach(section => {
      section.fields.forEach(field => {
        const raw = get(field.key);
        payload[field.key] = field.type === 'number' ? (Number(raw) || 0) : (raw || null);
      });
    });

    const { ok, data } = await adminApi.updateSettings(payload);
    if (ok) {
      toast.success('Settings saved successfully!');
    } else {
      toast.error(data?.error || 'Save failed');
    }
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
              <p className="text-gray-500 text-sm mt-1">Configure your store details and shipping</p>
            </div>
            <Button onClick={handleSave} disabled={saving || loading} className="bg-gray-900 hover:bg-gray-800 text-white gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {SETTINGS_SCHEMA.map(({ section, icon: Icon, fields }) => (
                <div key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-semibold text-gray-900">{section}</h2>
                  </div>

                  {/* Fields */}
                  <div className="p-6 space-y-4">
                    {fields.map(field => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          type={field.type || 'text'}
                          value={get(field.key)}
                          onChange={e => set(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Save button at bottom too */}
              <div className="flex justify-end pb-4">
                <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
