import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}
export async function OPTIONS() { return cors(NextResponse.json({}, { status: 200 })); }

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'DarElGhourabaa@Admin2026!';

function isAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${ADMIN_PASSWORD}`;
}

function unauthorized() {
  return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  const parts = (await params)?.path || [];
  const path = parts.join('/');
  const url = new URL(request.url);

  try {
    // Health
    if (path === '' || path === 'health') {
      return cors(NextResponse.json({ ok: true, service: 'Dar el Ghourabaa Market API v2' }));
    }

    // ── Public: Products ──────────────────────────────────────────────────────
    if (path === 'products') {
      const db = createSupabaseAdmin();
      const category = url.searchParams.get('category');
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const sort = url.searchParams.get('sort') || 'featured';
      const admin = url.searchParams.get('admin') === '1';

      let query = db.from('products').select('*');
      if (!admin) query = query.eq('published', true);
      if (category && category !== 'all') query = query.eq('category', category);

      const { data, error } = await query;
      if (error) return cors(NextResponse.json({ items: [], count: 0 }));

      let items = data || [];
      if (q) items = items.filter(p =>
        p.name_en?.toLowerCase().includes(q) ||
        p.name_ar?.includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );

      if (sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
      else if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
      else if (sort === 'featured') items = [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

      return cors(NextResponse.json({ items, count: items.length }));
    }

    // ── Public: Single Product by slug ────────────────────────────────────────
    if (path.startsWith('products/') && parts.length === 2) {
      const db = createSupabaseAdmin();
      const slug = parts[1];
      const { data, error } = await db.from('products').select('*').eq('slug', slug).maybeSingle();
      if (error || !data) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
      return cors(NextResponse.json({ product: data }));
    }

    // ── Public: Categories ────────────────────────────────────────────────────
    if (path === 'categories') {
      const db = createSupabaseAdmin();
      const { data, error } = await db.from('categories').select('*').order('sort_order');
      if (error) return cors(NextResponse.json({ items: [] }));
      return cors(NextResponse.json({ items: data || [] }));
    }

    // ── Public: Settings ──────────────────────────────────────────────────────
    if (path === 'settings') {
      const db = createSupabaseAdmin();
      const { data, error } = await db.from('store_settings').select('*');
      if (error) return cors(NextResponse.json({ settings: {} }));
      const settings = {};
      (data || []).forEach(row => { settings[row.key] = row.value; });
      return cors(NextResponse.json({ settings }));
    }

    // ── Public: Single order by ID ────────────────────────────────────────────
    if (path.startsWith('orders/')) {
      const id = path.split('/')[1];
      const db = createSupabaseAdmin();
      const { data, error } = await db.from('orders').select('*').eq('id', id).maybeSingle();
      if (error || !data) return cors(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
      return cors(NextResponse.json({ order: data }));
    }

    // ── ADMIN: All orders ─────────────────────────────────────────────────────
    if (path === 'admin/orders') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const status = url.searchParams.get('status');
      let query = db.from('orders').select('*').order('placed_at', { ascending: false });
      if (status && status !== 'all') query = query.eq('status', status);
      const { data, error } = await query;
      if (error) return cors(NextResponse.json({ orders: [] }));
      return cors(NextResponse.json({ orders: data || [] }));
    }

    // ── ADMIN: Dashboard stats ────────────────────────────────────────────────
    if (path === 'admin/stats') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, productsRes, todayOrdersRes, recentOrdersRes] = await Promise.all([
        db.from('orders').select('total, status'),
        db.from('products').select('id, stock, published'),
        db.from('orders').select('id').gte('placed_at', today.toISOString()),
        db.from('orders').select('*').order('placed_at', { ascending: false }).limit(5),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const lowStock = products.filter(p => p.stock <= 5).length;

      return cors(NextResponse.json({
        totalRevenue,
        totalOrders: orders.length,
        ordersToday: (todayOrdersRes.data || []).length,
        totalProducts: products.length,
        publishedProducts: products.filter(p => p.published).length,
        pendingOrders,
        lowStockProducts: lowStock,
        recentOrders: recentOrdersRes.data || [],
      }));
    }

    // ── ADMIN: Single product ─────────────────────────────────────────────────
    if (path.startsWith('admin/products/') && parts.length === 3) {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const id = parts[2];
      const { data, error } = await db.from('products').select('*').eq('id', id).maybeSingle();
      if (error || !data) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
      return cors(NextResponse.json({ product: data }));
    }

    // ── ADMIN: Categories (admin view) ────────────────────────────────────────
    if (path === 'admin/categories') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const { data, error } = await db.from('categories').select('*').order('sort_order');
      if (error) return cors(NextResponse.json({ categories: [] }));
      return cors(NextResponse.json({ categories: data || [] }));
    }

    // ── ADMIN: Settings ───────────────────────────────────────────────────────
    if (path === 'admin/settings') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const { data, error } = await db.from('store_settings').select('*');
      if (error) return cors(NextResponse.json({ settings: {} }));
      const settings = {};
      (data || []).forEach(row => { settings[row.key] = row.value; });
      return cors(NextResponse.json({ settings }));
    }

    // ── ADMIN: Shipping prices ─────────────────────────────────────────────────
    if (path === 'admin/shipping') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const { data, error } = await db.from('store_settings').select('value').eq('key', 'shipping_by_wilaya').maybeSingle();
      if (error) return cors(NextResponse.json({ shipping: {} }));
      return cors(NextResponse.json({ shipping: data?.value || {} }));
    }

    return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Server error' }, { status: 500 }));
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request, { params }) {
  const parts = (await params)?.path || [];
  const path = parts.join('/');
  const body = await request.json().catch(() => ({}));

  try {
    // ── Place order (lead) ────────────────────────────────────────────────────
    if (path === 'orders') {
      const { items, customer, address, notes, subtotal, shipping, total } = body || {};

      if (!Array.isArray(items) || items.length === 0)
        return cors(NextResponse.json({ error: 'No items in cart' }, { status: 400 }));
      if (!customer?.name?.trim())
        return cors(NextResponse.json({ error: 'Customer name is required' }, { status: 400 }));
      if (!customer?.phone?.trim())
        return cors(NextResponse.json({ error: 'Phone number is required' }, { status: 400 }));
      if (!address?.wilaya)
        return cors(NextResponse.json({ error: 'Province (Wilaya) is required' }, { status: 400 }));
      if (!address?.address?.trim())
        return cors(NextResponse.json({ error: 'Delivery address is required' }, { status: 400 }));

      const orderId = uuidv4();
      const orderNumber = 'DGM-' + orderId.split('-')[0].toUpperCase();
      const record = {
        id: orderId, order_number: orderNumber, status: 'new',
        payment_method: 'cash_on_delivery', payment_status: 'unpaid',
        items, customer: { name: customer.name.trim(), phone: customer.phone.trim() },
        address: { wilaya: address.wilaya, wilayaCode: address.wilayaCode || '', municipality: address.municipality || '', address: address.address.trim() },
        notes: notes || '', subtotal: Number(subtotal || 0), shipping: Number(shipping || 0),
        total: Number(total || 0), currency: 'DZD', placed_at: new Date().toISOString(),
      };

      try {
        const db = createSupabaseAdmin();
        const { error } = await db.from('orders').insert(record);
        if (error) console.warn('[orders insert]', error.message);
      } catch (e) { console.warn('[orders insert exception]', e?.message); }

      return cors(NextResponse.json({ ok: true, order: record }));
    }

    // ── Newsletter ────────────────────────────────────────────────────────────
    if (path === 'newsletter') {
      const { email } = body || {};
      if (!email) return cors(NextResponse.json({ error: 'Missing email' }, { status: 400 }));
      try {
        const db = createSupabaseAdmin();
        await db.from('newsletter_subscribers').insert({ id: uuidv4(), email, created_at: new Date().toISOString() });
      } catch (e) { /* ignore */ }
      return cors(NextResponse.json({ ok: true }));
    }

    // ── Admin verify ──────────────────────────────────────────────────────────
    if (path === 'admin/verify') {
      const { password } = body || {};
      if (password === ADMIN_PASSWORD) {
        return cors(NextResponse.json({ ok: true, token: ADMIN_PASSWORD }));
      }
      return cors(NextResponse.json({ error: 'Invalid password' }, { status: 401 }));
    }

    // ── ADMIN: Create product ─────────────────────────────────────────────────
    if (path === 'admin/products') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const product = {
        ...body,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await db.from('products').insert(product).select().single();
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true, product: data }));
    }

    // ── ADMIN: Create category ────────────────────────────────────────────────
    if (path === 'admin/categories') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const { data, error } = await db.from('categories').insert({ id: uuidv4(), ...body }).select().single();
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true, category: data }));
    }

    // ── ADMIN: Upload image URL (returns the URL after Supabase Storage upload) ─
    if (path === 'admin/upload') {
      if (!isAdmin(request)) return unauthorized();
      // We just pass through the signed URL to the client — actual upload happens client-side
      return cors(NextResponse.json({ ok: true }));
    }

    return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Server error' }, { status: 500 }));
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  const parts = (await params)?.path || [];
  const path = parts.join('/');
  const body = await request.json().catch(() => ({}));

  try {
    // ── Admin: update order status + notes ────────────────────────────────────
    if (path === 'admin/orders') {
      if (!isAdmin(request)) return unauthorized();
      const { id, status, notes } = body || {};
      const VALID_STATUSES = ['new', 'pending_call', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'];
      if (!id || !VALID_STATUSES.includes(status))
        return cors(NextResponse.json({ error: 'Invalid id or status' }, { status: 400 }));
      const db = createSupabaseAdmin();
      const updates = { status, updated_at: new Date().toISOString() };
      if (notes !== undefined) updates.notes = notes;
      const { error } = await db.from('orders').update(updates).eq('id', id);
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true }));
    }

    // ── ADMIN: Update product ─────────────────────────────────────────────────
    if (path.startsWith('admin/products/') && parts.length === 3) {
      if (!isAdmin(request)) return unauthorized();
      const id = parts[2];
      const db = createSupabaseAdmin();
      const { id: _id, created_at: _c, ...updates } = body;
      const { data, error } = await db.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true, product: data }));
    }

    // ── ADMIN: Update category ────────────────────────────────────────────────
    if (path.startsWith('admin/categories/') && parts.length === 3) {
      if (!isAdmin(request)) return unauthorized();
      const id = parts[2];
      const db = createSupabaseAdmin();
      const { id: _id, ...updates } = body;
      const { data, error } = await db.from('categories').update(updates).eq('id', id).select().single();
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true, category: data }));
    }

    // ── ADMIN: Update settings ────────────────────────────────────────────────
    if (path === 'admin/settings') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const updates = body || {};
      const upserts = Object.entries(updates).map(([key, value]) => ({ key, value }));
      const { error } = await db.from('store_settings').upsert(upserts, { onConflict: 'key' });
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true }));
    }

    // ── ADMIN: Update shipping prices by wilaya ───────────────────────────────
    if (path === 'admin/shipping') {
      if (!isAdmin(request)) return unauthorized();
      const db = createSupabaseAdmin();
      const shippingData = body || {};
      const { error } = await db.from('store_settings').upsert(
        { key: 'shipping_by_wilaya', value: shippingData },
        { onConflict: 'key' }
      );
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true }));
    }

    return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Server error' }, { status: 500 }));
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  const parts = (await params)?.path || [];
  const path = parts.join('/');

  try {
    // ── ADMIN: Delete product ─────────────────────────────────────────────────
    if (path.startsWith('admin/products/') && parts.length === 3) {
      if (!isAdmin(request)) return unauthorized();
      const id = parts[2];
      const db = createSupabaseAdmin();
      const { error } = await db.from('products').delete().eq('id', id);
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true }));
    }

    // ── ADMIN: Delete category ────────────────────────────────────────────────
    if (path.startsWith('admin/categories/') && parts.length === 3) {
      if (!isAdmin(request)) return unauthorized();
      const id = parts[2];
      const db = createSupabaseAdmin();
      const { error } = await db.from('categories').delete().eq('id', id);
      if (error) return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      return cors(NextResponse.json({ ok: true }));
    }

    return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Server error' }, { status: 500 }));
  }
}
