'use client';

import { removeSession } from '@/lib/session';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      await removeSession();
      router.replace('/');
    }
    logout();
  }, []);

  return <p>Logging out...</p>;
}
