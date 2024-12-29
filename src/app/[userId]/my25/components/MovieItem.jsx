'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { buildImageUrl } from '@/lib/buildImageUrl';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

export function MovieItem({
  movie,
  onSelect,
  onRemove,
  imageConfig,
  selected,
  dragging,
  dropping,
}) {
  const [deleteStyle, setDeleteStyle] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (selected) {
      scrollRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selected]);

  const imageUrl = useMemo(
    () =>
      movie.poster_path
        ? buildImageUrl({
            config: imageConfig,
            size: 'xs',
            path: movie.poster_path,
          })
        : null,
    [movie],
  );

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: movie.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const actionStyle = onSelect ? 'cursor-pointer' : 'cursor-move';
  const backgroundColor = dropping
    ? 'bg-indigo-100 dark:bg-blue-900 border-dashed border-indigo-300 dark:border-blue-700 color-indigo-300 dark:color-blue-700 border-4 text-opacity-50'
    : dragging
      ? 'opacity-90 bg-gray-100 dark:bg-gray-800 scale-95'
      : deleteStyle
        ? 'bg-red-100 dark:bg-red-800'
        : selected
          ? 'sm:bg-indigo-100 dark:sm:bg-blue-900'
          : '';

  return (
    <div
      className={`flex items-center mb-4 ${actionStyle} ${backgroundColor} sm:pr-2`}
      onClick={() => (onSelect ? onSelect(movie) : null)}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}>
      <div
        ref={scrollRef}
        className="h-24 bg-gray-200 dark:bg-gray-800 flex justify-center align-middle items-center"
        style={{ flex: '0 0 4rem' }}>
        {dropping ? (
          <span className="bg-indigo-100 dark:bg-blue-900 w-full h-full"></span>
        ) : imageUrl ? (
          <img className="w-full h-full" src={imageUrl} />
        ) : (
          <span className="text-2xl text-gray-400 dark:text-gray-600">?</span>
        )}
      </div>
      <div className="pr-3 pl-3 w-full flex-auto">
        {dropping ? (
          <b>Drop Here</b>
        ) : (
          <>
            <b>{movie.title}</b>
            <span> </span>
            <span className="text-sm">
              (
              {movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : '?'}
              )
            </span>
          </>
        )}
      </div>
      {onRemove && !dropping ? (
        <div
          className="cursor-pointer bg-red-100 dark:bg-red-900 hover:bg-red-700 dark:hover:bg-red-700 pr-2 pl-2 rounded-2xl hover:text-white dark:text-white deleteButton"
          onMouseEnter={() => setDeleteStyle(true)}
          onMouseLeave={() => setDeleteStyle(false)}
          onClick={() => onRemove(movie)}>
          <span className="text-2xl leading-none pointer-events-none">-</span>
        </div>
      ) : null}
    </div>
  );
}
