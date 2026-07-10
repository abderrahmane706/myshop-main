-- =====================================================
-- Dar El Ghourabaa Market — Schema v2 (Admin CMS)
-- Run this in Supabase SQL Editor AFTER schema.sql
-- =====================================================

-- -------------------------------------------------------
-- PRODUCTS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name_en         TEXT NOT NULL,
  name_ar         TEXT NOT NULL DEFAULT '',
  brand           TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'accessories',
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  compare_at      NUMERIC(10, 2),
  stock           INTEGER NOT NULL DEFAULT 0,
  sku             TEXT DEFAULT '',
  rating          NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  description_en  TEXT NOT NULL DEFAULT '',
  description_ar  TEXT NOT NULL DEFAULT '',
  images          JSONB NOT NULL DEFAULT '[]',
  specs           JSONB NOT NULL DEFAULT '[]',
  tags            JSONB NOT NULL DEFAULT '[]',
  featured        BOOLEAN NOT NULL DEFAULT false,
  bestseller      BOOLEAN NOT NULL DEFAULT false,
  published       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug      ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products (published);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------
-- CATEGORIES TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug     TEXT NOT NULL UNIQUE,
  name_en  TEXT NOT NULL,
  name_ar  TEXT NOT NULL DEFAULT '',
  icon     TEXT NOT NULL DEFAULT 'Tag',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- -------------------------------------------------------
-- STORE SETTINGS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'
);

-- -------------------------------------------------------
-- RLS
-- -------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public read for published products
CREATE POLICY "public_read_products"
  ON public.products FOR SELECT TO anon
  USING (published = true);

-- Public read categories
CREATE POLICY "public_read_categories"
  ON public.categories FOR SELECT TO anon
  USING (true);

-- Public read settings
CREATE POLICY "public_read_settings"
  ON public.store_settings FOR SELECT TO anon
  USING (true);

-- Seed default settings
INSERT INTO public.store_settings (key, value) VALUES
  ('store_name', '"Dar el Ghourabaa Market"'),
  ('store_logo', 'null'),
  ('contact_phone', '"+213xxxxxxxxx"'),
  ('contact_email', '"contact@darghourabaa.com"'),
  ('contact_address', '"Algeria"'),
  ('shipping_price_dz', '400'),
  ('free_shipping_threshold', '0'),
  ('social_instagram', '"https://instagram.com"'),
  ('social_facebook', '"https://facebook.com"'),
  ('social_whatsapp', '"+213xxxxxxxxx"')
ON CONFLICT (key) DO NOTHING;
