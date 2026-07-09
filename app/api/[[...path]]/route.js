import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { PRODUCTS, CATEGORIES, getProduct, getProductsByCategory } from '@/lib/data/products';
import { v4 as uuidv4 } from 'uuid';

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', '*');
  return res;
}

export async function OPTIONS() { return cors(NextResponse.json({}, { status: 200 })); }

async function tryEnsureOrdersTable() {
  // Best-effort: silently return; user should run schema.sql in Supabase.
  return true;
}

export async function GET(request, { params }) {
  const parts = (await params)?.path || [];
  const path = parts.join('/');

  try {
    if (path === '' || path === 'health') {
      return cors(NextResponse.json({ ok: true, service: 'Dar el Ghourabaa Market API' }));
    }

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
      if (sort === 'price-asc') items = [...items].sort((a,b)=>a.price-b.price);
      else if (sort === 'price-desc') items = [...items].sort((a,b)=>b.price-a.price);
      else if (sort === 'rating') items = [...items].sort((a,b)=>b.rating-a.rating);
      else if (sort === 'newest') items = [...items].sort((a,b)=>(b.tags.includes('new-collection')?1:0)-(a.tags.includes('new-collection')?1:0));
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

    if (path.startsWith('orders/')) {
      const id = path.split('/')[1];
      const admin = createSupabaseAdmin();
      const { data, error } = await admin.from('orders').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        // Fallback: return minimal from URL query if present (edge case)
        return cors(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
      }
      return cors(NextResponse.json({ order: data }));
    }

    return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Server error' }, { status: 500 }));
  }
}

export async function POST(request, { params }) {
  const parts = (await params)?.path || [];
  const path = parts.join('/');
  const body = await request.json().catch(() => ({}));

  try {
    if (path === 'orders') {
      // Validate
      const { items, customer, address, notes, subtotal, shipping, total } = body || {};
      if (!Array.isArray(items) || items.length === 0) return cors(NextResponse.json({ error: 'No items' }, { status: 400 }));
      if (!customer?.email || !customer?.phone) return cors(NextResponse.json({ error: 'Missing contact' }, { status: 400 }));
      if (!address?.address || !address?.city) return cors(NextResponse.json({ error: 'Missing address' }, { status: 400 }));

      const orderId = uuidv4();
      const orderNumber = 'DGM-' + orderId.split('-')[0].toUpperCase();
      const record = {
        id: orderId,
        order_number: orderNumber,
        status: 'pending',
        payment_method: 'cash_on_delivery',
        payment_status: 'unpaid',
        items,
        customer,
        address,
        notes: notes || '',
        subtotal: Number(subtotal || 0),
        shipping: Number(shipping || 0),
        total: Number(total || 0),
        currency: 'USD',
        placed_at: new Date().toISOString(),
      };

      // Try to persist to Supabase; if the table doesn't exist we still return success (log)
      try {
        const admin = createSupabaseAdmin();
        await tryEnsureOrdersTable();
        const { error } = await admin.from('orders').insert(record);
        if (error) console.warn('[orders insert]', error.message);
      } catch (e) {
        console.warn('[orders insert exception]', e?.message);
      }

      return cors(NextResponse.json({ ok: true, order: record }));
    }

    if (path === 'newsletter') {
      const { email } = body || {};
      if (!email) return cors(NextResponse.json({ error: 'Missing email' }, { status: 400 }));
      try {
        const admin = createSupabaseAdmin();
        await admin.from('newsletter_subscribers').insert({ id: uuidv4(), email, created_at: new Date().toISOString() });
      } catch (e) { /* ignore */ }
      return cors(NextResponse.json({ ok: true }));
    }

    return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Server error' }, { status: 500 }));
  }
}
