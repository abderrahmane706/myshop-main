import Link from 'next/link';
import { ProductClient } from './ProductClient';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

// ── Server-side metadata ──
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const db = createSupabaseAdmin();
  const { data: product } = await db.from('products').select('*').eq('slug', slug).maybeSingle();
  
  if (!product) {
    return { title: 'Product Not Found | Dar el Ghourabaa Market' };
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dargelghourabaa.com';
  return {
    title: `${product.name_en} — ${product.brand} | Dar el Ghourabaa Market`,
    description: product.description_en,
    keywords: `${product.brand}, ${product.category}, ${product.name_en}, luxury, dar el ghourabaa`,
    openGraph: {
      title: `${product.name_en} — ${product.brand}`,
      description: product.description_en,
      images: product.images?.[0] ? [{ url: product.images?.[0], width: 1200, height: 1200 }] : [],
      type: 'website',
      url: `${baseUrl}/products/${product.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const db = createSupabaseAdmin();
  const { data: products } = await db.from('products').select('slug').eq('published', true);
  return (products || []).map((p) => ({ slug: p.slug }));
}

// ── Server component ──
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const db = createSupabaseAdmin();
  const { data: product } = await db.from('products').select('*').eq('slug', slug).maybeSingle();

  if (!product || !product.published) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="text-brand-royal mt-4 inline-block">Back to shop</Link>
      </div>
    );
  }

  return <ProductClient product={product} />;
}
