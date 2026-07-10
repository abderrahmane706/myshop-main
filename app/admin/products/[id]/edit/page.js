'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi, hasAdminToken } from '@/lib/admin-api';
import { ProductForm } from '@/components/admin/ProductForm';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasAdminToken()) { router.replace('/admin'); return; }
    adminApi.getProduct(id).then(({ ok, data }) => {
      if (ok && data.product) {
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={() => router.push('/admin/products')} className="text-blue-600 hover:underline">
            ← Back to products
          </button>
        </div>
      </div>
    );
  }

  return <ProductForm initial={product} productId={id} />;
}
