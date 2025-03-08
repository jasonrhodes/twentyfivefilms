'use client';

import { useState, useEffect } from 'react';

export default function useAdminAllMovies({ limit }) {
  const [allMovies, setAllMovies] = useState(null);

  useEffect(() => {
    // call database to get "all movies"
    // set state
  }, []);

  return allMovies;
}
