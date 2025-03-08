'use client';

import { getAdminStats } from '@/lib/db';
import { useState, useEffect } from 'react';

export default function useAdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function retrieve() {
      const results = await getAdminStats();
      console.log('Stats query results', results);
      setStats(results);
    }
    retrieve();
  }, []);

  return stats;
}
