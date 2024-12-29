'use client';

import { Input } from '@/components/Input';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback } from 'react';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const router = useRouter();
  const onUserIdChange = useCallback(val => setUserId(val));
  const onLogin = useCallback(e => {
    e.preventDefault();
    if (userId.length === 0) {
      return;
    }
    router.push(`/${userId}/my25`);
  });

  return (
    <div>
      <h1>Log In</h1>
      <form action="#" onSubmit={onLogin}>
        <Input
          id="userId"
          label="Your unique identifier"
          onChange={onUserIdChange}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          data-bwignore="true"
        />
        <button type="submit">Go</button>
      </form>
    </div>
  );
}
