import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { PRODUCTS, CATEGORIES, getProduct, getProductsByCategory } from '@/lib/data/products';
import { v4 as uuidv4 } from 'uuid';

// ── CORS ──────────────────────────────────────────────────────────────────────
function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}
export async function OPTIONS() { return cors(NextResponse.json({}, { status: 200 })); }

// ── Admin auth helper ─────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

function isAdminAuthorized(request) {
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${ADMIN_PASSWORD}`;
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  const parts = (await params)?.path || [];
  const path = parts.join('/');

  try {
    // Health check
    if (path === '' || path === 'health') {
      return cors(NextResponse.json({ ok: true, service: 'Dar el Ghourabaa Market API' }));
    }

    // Products
    if (path === 'products') {
      const url = new URL(request.url);
      const category = url.searchParams.get('category');
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const sort = url.searchParams.get('sort') || 'featured';
      let items = category ? getProductsByCategory(category) : PRODUCTS;
      if (q) {
        items = items.filter(p =>
          p.name_en.toLowerCase().includes(q) ||
          p.name_ar.includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.includes(q)
        );
      }
      if (sort === 'price-asc')  items = [...items].sort((a,b) => a.price - b.price);
      else if (sort === 'price-desc') items = [...items].sort((a,b) => b.price - a.price);
      else if (sort === 'rating')     items = [...items].sort((a,b) => b.rating - a.rating);
      else if (sort === 'newest')     items = [...items].sort((a,b) => (b.tags.includes('new-collection')?1:0) - (a.tags.includes('new-collection')?1:0));
      return cors(NextResponse.json({ items, count: items.length }));
    }

    if (path === 'categories') {
      return cors(NextResponse.json({ items: CATEGORIES }));
    }

    if (path.startsWith('products/')) {
      const slug = path.split('/')[1];
      const p = getProduct(slug);
      if (!p) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
      return cors(NextResponse.json({ product: p }));
    }

    // Single order by ID (public — for confirmation page)
    if (path.startsWith('orders/')) {
      const id = path.split('/')[1];
      const admin = createSupabaseAdmin();
      const { data, error } = await admin.from('orders').select('*').eq('id', id).maybeSingle();
      if (error || !data) return cors(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
      return cors(NextResponse.json({ order: data }));
    }

    // ── ADMIN: all orders list ────────────────────────────────────────────────
    if (path === 'admin/orders') {
      if (!isAdminAuthorized(request)) {
        return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }
      const admin = createSupabaseAdmin();
      const { data, error } = await admin
        .from('orders')
        .select('*')
        .order('placed_at', { ascending: false });
      if (error) {
        console.warn('[admin orders fetch]', error.message);
        return cors(NextResponse.json({ orders: [] }));
      }
      return cors(NextResponse.json({ orders: data || [] }));
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
    // ── Place order (lead) ──────────────────────────────────────────────────
    if (path === 'orders') {
      const { items, customer, address, notes, subtotal, shipping, total } = body || {};

      // Validate required fields
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
        id: orderId,
        order_number: orderNumber,
        status: 'pending',
        payment_method: 'cash_on_delivery',
        payment_status: 'unpaid',
        items,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
        },
        address: {
          wilaya: address.wilaya,
          wilayaCode: address.wilayaCode || '',
          municipality: address.municipality || '',
          address: address.address.trim(),
        },
        notes: notes || '',
        subtotal: Number(subtotal || 0),
        shipping: Number(shipping || 0),
        total: Number(total || 0),
        currency: 'DZD',
        placed_at: new Date().toISOString(),
      };

      // Persist to Supabase (best-effort — never block the customer response)
      try {
        const admin = createSupabaseAdmin();
        const { error } = await admin.from('orders').insert(record);
        if (error) console.warn('[orders insert]', error.message);
      } catch (e) {
        console.warn('[orders insert exception]', e?.message);
      }

      return cors(NextResponse.json({ ok: true, order: record }));
    }

    // ── Newsletter ──────────────────────────────────────────────────────────
    if (path === 'newsletter') {
      const { email } = body || {};
      if (!email) return cors(NextResponse.json({ error: 'Missing email' }, { status: 400 }));
      try {
        const admin = createSupabaseAdmin();
        await admin.from('newsletter_subscribers').insert({ id: uuidv4(), email, created_at: new Date().toISOString() });
      } catch (e) { /* ignore */ }
      return cors(NextResponse.json({ ok: true }));
    }

    // ── Admin: verify password ──────────────────────────────────────────────
    if (path === 'admin/verify') {
      const { password } = body || {};
      if (password === ADMIN_PASSWORD) {
        return cors(NextResponse.json({ ok: true, token: ADMIN_PASSWORD }));
      }
      return cors(NextResponse.json({ error: 'Invalid password' }, { status: 401 }));
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
    // ── Admin: update order status ──────────────────────────────────────────
    if (path === 'admin/orders') {
      if (!isAdminAuthorized(request)) {
        return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }
      const { id, status } = body || {};
      const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
      if (!id || !VALID_STATUSES.includes(status)) {
        return cors(NextResponse.json({ error: 'Invalid id or status' }, { status: 400 }));
      }
      const admin = createSupabaseAdmin();
      const { error } = await admin
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        console.warn('[status update]', error.message);
        return cors(NextResponse.json({ error: error.message }, { status: 500 }));
      }
      return cors(NextResponse.json({ ok: true }));
    }

    return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Server error' }, { status: 500 }));
  }
}
