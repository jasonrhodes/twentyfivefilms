'use client'

import { Input } from '@/components/input';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState(null);
  const router = useRouter();
  const onEmailChange = useCallback(val => setEmail(val));
  const onLogin = useCallback((e) => {
    e.preventDefault();
    // TODO route to a user id marked route like /[user]/my25
    router.push('/submit');
  });

  return (
    <div>
      <h1>Log In</h1>
      <form action="#" onSubmit={onLogin}>
        <Input
          id="userId"
          label="Your unique identifier"
          onChange={onEmailChange}
          autoComplete="off" 
          data-1p-ignore 
          data-lpignore="true"
          data-bwignore="true"
        />
        <button type="submit">Go</button>
      </form>
    </div>
  )
}