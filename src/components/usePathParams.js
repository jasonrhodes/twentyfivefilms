'use client';

import { getUserByUsername } from '@/lib/db';
import * as logger from '@/lib/logger';
import { useEffect, useState } from 'react';

export function usePathParams({ asyncParams }) {
  const [isReady, setIsReady] = useState(false);
  const [params, setParams] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function retrieve() {
      const p = await asyncParams;
      setParams(p);

      logger.debug('usePathParams: Found parsed params', p);

      if (p?.username) {
        const user = await getUserByUsername({ username: p.username });
        setUser(user);
      }

      setIsReady(true);
    }
    retrieve();
  }, [asyncParams]);

  return { pathParamsReady: isReady, params, user };
}
