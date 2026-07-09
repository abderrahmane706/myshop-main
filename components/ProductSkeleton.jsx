'use client';

/**
 * ProductSkeleton — animated placeholder matching ProductCard dimensions.
 * Use inside a grid wherever ProductCard would appear while loading.
 */
export function ProductSkeleton() {
  return (
    <div className="group relative animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-brand-bg to-brand-bg-alt" />
      {/* Text placeholders */}
      <div className="pt-4 space-y-2">
        <div className="h-3 w-16 rounded-full bg-brand-bg-alt" />
        <div className="h-4 w-full rounded-full bg-brand-bg-alt" />
        <div className="h-3 w-12 rounded-full bg-brand-bg-alt" />
        <div className="h-5 w-20 rounded-full bg-brand-bg-alt" />
      </div>
    </div>
  );
}

/**
 * ProductGridSkeleton — renders N skeleton cards in a matching grid layout.
 */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
