// Centralized admin API client with bearer token auth
const ADMIN_TOKEN_KEY = 'admin_token';

function getToken() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function hasAdminToken() {
  return !!getToken();
}

async function req(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`/api/${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearAdminToken();
    window.location.href = '/admin';
  }
  return { ok: res.ok, status: res.status, data };
}

export const adminApi = {
  // Auth
  login: (password) => req('POST', 'admin/verify', { password }),

  // Stats
  getStats: () => req('GET', 'admin/stats'),

  // Orders
  getOrders: (status) => req('GET', `admin/orders${status && status !== 'all' ? `?status=${status}` : ''}`),
  updateOrderStatus: (id, status) => req('PUT', 'admin/orders', { id, status }),

  // Products
  getProducts: () => req('GET', 'products?admin=1'),
  getProduct: (id) => req('GET', `admin/products/${id}`),
  createProduct: (data) => req('POST', 'admin/products', data),
  updateProduct: (id, data) => req('PUT', `admin/products/${id}`, data),
  deleteProduct: (id) => req('DELETE', `admin/products/${id}`),

  // Categories
  getCategories: () => req('GET', 'admin/categories'),
  createCategory: (data) => req('POST', 'admin/categories', data),
  updateCategory: (id, data) => req('PUT', `admin/categories/${id}`, data),
  deleteCategory: (id) => req('DELETE', `admin/categories/${id}`),

  // Settings
  getSettings: () => req('GET', 'admin/settings'),
  updateSettings: (data) => req('PUT', 'admin/settings', data),
};

// Upload image to Supabase Storage via signed URL
export async function uploadImageToSupabase(file) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const ext = file.name.split('.').pop();
  const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
  return urlData.publicUrl;
}
