-- =====================================================================
-- Dar El Ghourabaa Market — Order System Migration
-- Run this in Supabase SQL Editor AFTER the initial schema_complete.sql
-- =====================================================================

-- 1. Expand order status CHECK constraint to include all new statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'new', 'pending_call', 'confirmed', 'preparing',
    'shipped', 'delivered', 'cancelled', 'returned'
  ));

-- 2. Update the default status for new orders
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'new';

-- 3. Migrate any existing 'pending' orders to 'new'
UPDATE public.orders SET status = 'new' WHERE status = 'pending';

-- 4. Add shipping_by_wilaya setting (JSON object: { "Alger": 500, "Oran": 700, ... })
INSERT INTO public.store_settings (key, value)
VALUES ('shipping_by_wilaya', '{}')
ON CONFLICT (key) DO NOTHING;

-- 5. Storage RLS policies for product-images (run only if not already applied)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Run these only if the policies don't already exist:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_public_read' AND tablename = 'objects'
  ) THEN
    EXECUTE $policy$CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images')$policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_anon_insert' AND tablename = 'objects'
  ) THEN
    EXECUTE $policy$CREATE POLICY "storage_anon_insert" ON storage.objects FOR INSERT TO anon
      WITH CHECK (bucket_id = 'product-images' AND (
        storage.extension(name) = 'png' OR storage.extension(name) = 'jpg' OR
        storage.extension(name) = 'jpeg' OR storage.extension(name) = 'webp' OR
        storage.extension(name) = 'gif'
      ))$policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_anon_update' AND tablename = 'objects'
  ) THEN
    EXECUTE $policy$CREATE POLICY "storage_anon_update" ON storage.objects FOR UPDATE TO anon
      USING (bucket_id = 'product-images')$policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_anon_delete' AND tablename = 'objects'
  ) THEN
    EXECUTE $policy$CREATE POLICY "storage_anon_delete" ON storage.objects FOR DELETE TO anon
      USING (bucket_id = 'product-images')$policy$;
  END IF;
END $$;
