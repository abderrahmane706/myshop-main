-- =====================================================
-- Dar El Ghourabaa Market — Supabase Schema
-- Run this SQL in the Supabase SQL Editor once.
-- =====================================================

-- -------------------------------------------------------
-- ORDERS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY,
  order_number     TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_method   TEXT NOT NULL DEFAULT 'cash_on_delivery',
  payment_status   TEXT NOT NULL DEFAULT 'unpaid'
                   CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  items            JSONB NOT NULL DEFAULT '[]',
  customer         JSONB NOT NULL DEFAULT '{}',
  address          JSONB NOT NULL DEFAULT '{}',
  notes            TEXT DEFAULT '',
  subtotal         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'USD',
  placed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Index for fast order number lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON public.orders (placed_at DESC);

-- -------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers (email);

-- -------------------------------------------------------
-- ROW LEVEL SECURITY
-- -------------------------------------------------------
-- Orders: only the service_role key can read/write
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow server-side inserts via service_role (no RLS needed — service_role bypasses RLS)
-- Block all anonymous/authenticated public reads of orders for security
-- (No customer-facing read needed: confirmation page gets order details from POST response)

-- Newsletter: allow anonymous insert only
CREATE POLICY "Allow anonymous newsletter signup"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- -------------------------------------------------------
-- HELPFUL VIEWS (for future admin dashboard)
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.orders_summary AS
SELECT
  id,
  order_number,
  status,
  payment_status,
  (customer->>'firstName') || ' ' || (customer->>'lastName') AS customer_name,
  (customer->>'email') AS customer_email,
  (customer->>'phone') AS customer_phone,
  (address->>'city') AS city,
  (address->>'country') AS country,
  total,
  currency,
  placed_at,
  updated_at
FROM public.orders
ORDER BY placed_at DESC;
