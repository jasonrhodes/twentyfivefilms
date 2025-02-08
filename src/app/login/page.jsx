'use client';

import { Input } from '@/components/Input';
import { loginUser } from '@/lib/db';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const onUsernameChange = useCallback(
    (val) => {
      setErrorMessage('');
      setUsername(val);
    },
    [setUsername]
  );
  const onPasswordChange = useCallback(
    (val) => {
      setErrorMessage('');
      setPassword(val);
    },
    [setPassword]
  );
  const onLogin = useCallback(
    async (e) => {
      setErrorMessage('');
      e.preventDefault();
      if (username.length === 0) {
        return;
      }
      console.log('About to log in attempt with credentials', {
        username,
        password
      });
      const loggedInUser = await loginUser({ username, password });
      if (loggedInUser.error === 'LoginError') {
        setErrorMessage(loggedInUser.message);
      } else {
        router.push(`/rankings/${username}`);
      }
    },
    [router, username, password]
  );

  return (
    <div>
      <h1>Log In</h1>
      {errorMessage && <p className="text-red-700">{errorMessage}</p>}
      <form action="#" onSubmit={onLogin}>
        <Input id="userId" label="Username" onChange={onUsernameChange} />
        <Input
          id="password"
          type="password"
          label="Password"
          onChange={onPasswordChange}
        />
        <button type="submit">Go</button>
      </form>
    </div>
  );
}
