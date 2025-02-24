'use client';

import { getTmdbConfig } from '@/lib/getTmdbConfig';
import { useState, useEffect } from 'react';

export default function useTmdbImageConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function retrieveTmdbConfig() {
      const config = await getTmdbConfig();
      setConfig(config.images);
    }

    retrieveTmdbConfig();
  }, [setConfig]);

  return config;
}
