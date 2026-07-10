import { createSupabaseAdmin } from '@/lib/supabase/admin';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dargelghourabaa.com';

  const db = createSupabaseAdmin();
  const [pRes, cRes] = await Promise.all([
    db.from('products').select('slug, updated_at').eq('published', true),
    db.from('categories').select('slug')
  ]);

  const products = pRes.data || [];
  const categories = cRes.data || [];

  const mainPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/checkout`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  const categoryPages = categories.map((c) => ({
    url: `${baseUrl}/products?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productPages = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...mainPages, ...categoryPages, ...productPages];
}
