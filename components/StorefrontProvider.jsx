'use client';
import { useRef } from 'react';
import { useStorefront } from '@/lib/store/storefront';

export function StorefrontProvider({ data, children }) {
  const initialized = useRef(false);
  if (!initialized.current) {
    useStorefront.setState(data);
    initialized.current = true;
  }
  return children;
}
