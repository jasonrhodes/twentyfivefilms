'use client';

import { getAuthTokenRecord } from '@/lib/db';
import { setSession } from '@/lib/session';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

export default function CheckTokenPage() {
  return (
    <Suspense>
      <div className="py-20">
        <ShowToken />
      </div>
    </Suspense>
  );
}

function ShowToken() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const authToken = searchParams.get('authToken');

  const router = useRouter();

  useEffect(() => {
    async function retrieve() {
      setLoading(true);
      const record = await getAuthTokenRecord({ token: authToken });
      if (record?.user) {
        setUser(record.user);
        delete record.user.hashedPassword;
        await setSession({ user: record.user });
        router.push(`/rankings/${record.user.username}/all-time`);
      }
      setLoading(false);
    }
    retrieve();
  }, [authToken, router]);

  if (!authToken) {
    return <p>No auth token provided</p>;
  }

  if (loading) {
    return <p>Looking up user...</p>;
  }

  if (!user) {
    return <p>No user found for this token {authToken}</p>;
  }

  return <p>Redirecting...</p>;
}
