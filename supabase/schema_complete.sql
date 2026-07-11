-- =====================================================================
-- Dar El Ghourabaa Market — Complete Production Schema
-- Run this ONCE in the Supabase SQL Editor on a fresh project.
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 0. UTILITY: auto-update updated_at timestamps
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 1. PRODUCTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        NOT NULL UNIQUE,
  name_en         TEXT        NOT NULL,
  name_ar         TEXT        NOT NULL DEFAULT '',
  brand           TEXT        NOT NULL DEFAULT '',
  category        TEXT        NOT NULL DEFAULT 'accessories',
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  compare_at      NUMERIC(10, 2),
  stock           INTEGER     NOT NULL DEFAULT 0,
  sku             TEXT        DEFAULT '',
  rating          NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
  reviews_count   INTEGER     NOT NULL DEFAULT 0,
  description_en  TEXT        NOT NULL DEFAULT '',
  description_ar  TEXT        NOT NULL DEFAULT '',
  images          JSONB       NOT NULL DEFAULT '[]',
  specs           JSONB       NOT NULL DEFAULT '[]',
  tags            JSONB       NOT NULL DEFAULT '[]',
  featured        BOOLEAN     NOT NULL DEFAULT false,
  bestseller      BOOLEAN     NOT NULL DEFAULT false,
  published       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug      ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products (published);
CREATE INDEX IF NOT EXISTS idx_products_featured  ON public.products (featured);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT    NOT NULL UNIQUE,
  name_en    TEXT    NOT NULL,
  name_ar    TEXT    NOT NULL DEFAULT '',
  icon       TEXT    NOT NULL DEFAULT 'Tag',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_categories_slug       ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories (sort_order);

-- ─────────────────────────────────────────────────────────────────────
-- 3. ORDERS
--    items    – JSONB array: [{id, name_en, name_ar, price, qty, image}]
--    customer – JSONB: {name, phone}
--    address  – JSONB: {wilaya, wilayaCode, municipality, address}
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number   TEXT        NOT NULL UNIQUE,
  status         TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN (
                                 'pending','confirmed','preparing',
                                 'shipped','delivered','cancelled'
                               )),
  payment_method TEXT        NOT NULL DEFAULT 'cash_on_delivery',
  payment_status TEXT        NOT NULL DEFAULT 'unpaid'
                               CHECK (payment_status IN ('unpaid','paid','refunded')),
  items          JSONB       NOT NULL DEFAULT '[]',
  customer       JSONB       NOT NULL DEFAULT '{}',
  address        JSONB       NOT NULL DEFAULT '{}',
  notes          TEXT        NOT NULL DEFAULT '',
  subtotal       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  shipping       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency       TEXT        NOT NULL DEFAULT 'DZD',
  placed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status    ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON public.orders (placed_at DESC);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 4. STORE SETTINGS  (key-value store)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.store_settings (
  key   TEXT  PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'
);

-- ─────────────────────────────────────────────────────────────────────
-- 5. NEWSLETTER SUBSCRIBERS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers (email);

-- ─────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ── Products ──────────────────────────────────────────────────────────
-- Anon users may only read published products.
-- All writes go through the server-side service_role key (bypasses RLS).
CREATE POLICY "anon_read_published_products"
  ON public.products FOR SELECT TO anon
  USING (published = true);

-- ── Categories ────────────────────────────────────────────────────────
CREATE POLICY "anon_read_categories"
  ON public.categories FOR SELECT TO anon
  USING (true);

-- ── Orders ────────────────────────────────────────────────────────────
-- Customers may insert orders without auth.
CREATE POLICY "anon_insert_orders"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (true);

-- Customers may read their own order by ID (no auth — UI does a GET /orders/:id).
CREATE POLICY "anon_read_orders_by_id"
  ON public.orders FOR SELECT TO anon
  USING (true);

-- ── Store Settings ────────────────────────────────────────────────────
CREATE POLICY "anon_read_settings"
  ON public.store_settings FOR SELECT TO anon
  USING (true);

-- ── Newsletter ────────────────────────────────────────────────────────
CREATE POLICY "anon_insert_newsletter"
  ON public.newsletter_subscribers FOR INSERT TO anon
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 7. STORAGE — product-images bucket
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read (storefront customers see product images)
CREATE POLICY "storage_public_read_product_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Anon upload (admin panel uses the anon key for direct browser → Storage uploads)
CREATE POLICY "storage_anon_insert_product_images"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'product-images' AND (
      storage.extension(name) = 'png'  OR
      storage.extension(name) = 'jpg'  OR
      storage.extension(name) = 'jpeg' OR
      storage.extension(name) = 'webp' OR
      storage.extension(name) = 'gif'
    )
  );

-- Anon update — needed because the upload uses { upsert: true }
CREATE POLICY "storage_anon_update_product_images"
  ON storage.objects FOR UPDATE TO anon
  USING (bucket_id = 'product-images');

-- Anon delete — needed so admin can remove old images
CREATE POLICY "storage_anon_delete_product_images"
  ON storage.objects FOR DELETE TO anon
  USING (bucket_id = 'product-images');

-- ─────────────────────────────────────────────────────────────────────
-- 8. DEFAULT SEED DATA
-- ─────────────────────────────────────────────────────────────────────

-- Default store settings
INSERT INTO public.store_settings (key, value) VALUES
  ('store_name',              '"Dar el Ghourabaa Market"'),
  ('store_logo',              'null'),
  ('contact_phone',           '"+213xxxxxxxxx"'),
  ('contact_email',           '"contact@darghourabaa.com"'),
  ('contact_address',         '"Algeria"'),
  ('shipping_price_dz',       '400'),
  ('free_shipping_threshold', '0'),
  ('social_instagram',        '"https://instagram.com"'),
  ('social_facebook',         '"https://facebook.com"'),
  ('social_whatsapp',         '"+213xxxxxxxxx"')
ON CONFLICT (key) DO NOTHING;

-- Default categories
INSERT INTO public.categories (id, slug, name_en, name_ar, icon, sort_order) VALUES
  (gen_random_uuid(), 'watches',      'Watches',     'ساعات',      'Watch',  1),
  (gen_random_uuid(), 'accessories',  'Accessories', 'إكسسوارات',  'Gem',    2),
  (gen_random_uuid(), 'jewelry',      'Jewelry',     'مجوهرات',    'Star',   3),
  (gen_random_uuid(), 'gifts',        'Gifts',       'هدايا',      'Gift',   4)
ON CONFLICT (slug) DO NOTHING;
