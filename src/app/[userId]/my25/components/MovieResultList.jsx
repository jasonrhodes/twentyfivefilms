'use client';

import React, { useCallback } from 'react';
import { MovieItem } from './MovieItem';

export function MovieResultList({
  movies,
  onSelect,
  imageConfig,
  selectedIndex,
  setSelectedIndex,
  disableHoverSelect,
}) {
  const handleHover = useCallback((e, index) => {
    if (!disableHoverSelect) {
      setSelectedIndex(index);
    }
  });

  return (
    <div>
      <ul>
        {movies.map((movie, i) => (
          <li
            key={`${movie.title}-${movie.id}`}
            onMouseEnter={e => handleHover(e, i)}>
            <MovieItem
              movie={movie}
              onSelect={onSelect}
              imageConfig={imageConfig}
              selected={i === selectedIndex}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
