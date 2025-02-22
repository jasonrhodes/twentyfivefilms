'use client';

import { getUserById } from '@/lib/db';
import { getSession } from '@/lib/session';
import { useEffect, useState } from 'react';

export function useSession() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function retrieve() {
      const session = await getSession();

      if (session) {
        const updatedUser = await getUserById({ id: session.user.id });
        session.user = updatedUser;
        setSession(session);
      }

      setIsReady(true);
    }
    retrieve();
  }, [setIsReady]);

  return { sessionReady: isReady, session };
}
