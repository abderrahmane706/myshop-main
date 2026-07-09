import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | Dar el Ghourabaa Market',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="container py-24 md:py-32 text-center">
      {/* Decorative number */}
      <div
        className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter select-none"
        style={{
          background: 'linear-gradient(135deg, #0B3C91 0%, #1E5EFF 50%, #FF7A00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        aria-hidden="true"
      >
        404
      </div>

      <h1 className="mt-2 text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">
        Page not found
      </h1>
      <p className="mt-4 text-brand-text/60 text-lg max-w-md mx-auto">
        We couldn&apos;t find what you were looking for. It may have moved or never existed.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="h-12 px-7 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-sm inline-flex items-center gap-2 shadow-orange transition"
        >
          Browse products
        </Link>
        <Link
          href="/"
          className="h-12 px-7 rounded-full border border-brand-dark/15 hover:bg-brand-bg text-brand-dark font-semibold text-sm inline-flex items-center gap-2 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
