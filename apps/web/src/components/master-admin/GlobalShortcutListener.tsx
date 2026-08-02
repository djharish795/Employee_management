'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalShortcutListener() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        router.push('/master-auth');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  return null;
}
