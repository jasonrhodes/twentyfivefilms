'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { buildImageUrl } from '@/lib/buildImageUrl';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

function MovieItem({ movie, imageConfig }) {
  const imageUrl = useMemo(
    () =>
      movie.poster_path
        ? buildImageUrl({
            config: imageConfig,
            size: 'xs',
            path: movie.poster_path
          })
        : null,
    [movie]
  );

  return (
    <>
      <div
        className="h-24 bg-gray-200 dark:bg-gray-800 flex justify-center align-middle items-center"
        style={{ flex: '0 0 4rem' }}
      >
        {imageUrl ? (
          <img className="w-full h-full" src={imageUrl} />
        ) : (
          <span className="text-2xl text-gray-400 dark:text-gray-600">?</span>
        )}
      </div>
      <div className="pr-3 pl-3 w-full flex-auto">
        <b>{`${movie.title} `}</b>
        <span className="text-sm">
          (
          {movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : '?'}
          )
        </span>
      </div>
    </>
  );
}

function MovieDropZone({listIsOverflowing}) {
  return (
    <>
      <div className="h-24" style={{ flex: '0 0 4rem' }} />
      <div className="pr-3 pl-3 w-full flex-auto">
        <b>{listIsOverflowing ? 'List Full' : 'Drop Here'}</b>
      </div>
    </>
  );
}

export function SearchMovieItem({ movie, onSelect, selected, imageConfig }) {
  const scrollRef = useRef();

  useEffect(() => {
    if (selected) {
      scrollRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selected]);

  const backgroundColor = selected
    ? 'sm:bg-indigo-100 dark:sm:bg-blue-900'
    : '';

  return (
    <div
      className={`flex items-center h-24 mb-4 cursor-pointer ${backgroundColor} sm:pr-2`}
      onClick={() => onSelect(movie)}
      ref={scrollRef}
    >
      <MovieItem imageConfig={imageConfig} movie={movie} />
    </div>
  );
}

export function ListMovieItem({
  movie,
  onRemoveButton,
  imageConfig,
  dragging,
  dropping,
  listIsOverflowing
}) {
  const [deleteStyle, setDeleteStyle] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: movie.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const backgroundColor = () => {
    if (dropping && listIsOverflowing) {
      return 'bg-red-100 dark:bg-red-800 border-dashed border-red-300 dark:border-red-600 color-red-300 dark:color-red-800 border-4 text-opacity-50';
    } else if (dropping) {
      return 'bg-indigo-100 dark:bg-blue-900 border-dashed border-indigo-300 dark:border-blue-700 color-indigo-300 dark:color-blue-700 border-4 text-opacity-50';
    } else if (dragging) {
      return 'opacity-90 bg-gray-100 dark:bg-gray-800 scale-95';
    } else if (deleteStyle) {
      return 'bg-red-100 dark:bg-red-800';
    }
    return '';
  };

  return (
    <div
      className={`flex items-center h-24 mb-4 cursor-move ${backgroundColor()} sm:pr-2`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {dropping ? (
        <MovieDropZone listIsOverflowing={listIsOverflowing} />
      ) : (
        <>
          <MovieItem imageConfig={imageConfig} movie={movie} />
          <div
            className="cursor-pointer bg-red-100 dark:bg-red-900 hover:bg-red-700 dark:hover:bg-red-700 pr-2 pl-2 rounded-2xl hover:text-white dark:text-white deleteButton"
            onMouseEnter={() => setDeleteStyle(true)}
            onMouseLeave={() => setDeleteStyle(false)}
            onClick={() => onRemoveButton(movie)}
          >
            <span className="text-2xl leading-none pointer-events-none">-</span>
          </div>
        </>
      )}
    </div>
  );
}
