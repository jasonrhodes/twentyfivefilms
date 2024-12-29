'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  useDraggable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { IconPlus } from '@tabler/icons-react';
import { MovieItem } from './MovieItem';

class MyMouserSensor extends MouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown',
      handler: ({ nativeEvent }) =>
        !nativeEvent.target.classList.contains('deleteButton'),
    },
  ];
}

function keyCodeListener(code, func) {
  const keyFunction = event => {
    event.key === code && func();
  };
  document.addEventListener('keydown', keyFunction);
  return () => {
    document.removeEventListener('keydown', keyFunction);
  };
}

function Draggable(props) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.id,
  });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ listStyle: 'none' }}>
      {props.children}
    </li>
  );
}

export function FavoriteMovieList({
  favorites,
  setFavorites,
  onFavoriteRemove,
  setShowModal,
  imageConfig,
}) {
  const [activeId, setActiveId] = useState(null);

  const handleDragEnd = event => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFavorites(movies => {
        const oldIndex = movies.findIndex(movie => movie.id === active.id);
        const newIndex = movies.findIndex(movie => movie.id === over.id);
        return arrayMove(movies, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  const activeMovie = favorites.find(movie => movie.id === activeId);

  const sensors = useSensors(
    useSensor(MyMouserSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
  );

  useEffect(() => keyCodeListener('Enter', () => setShowModal(true)), []);

  return (
    <div className="w-full flex-auto">
      <section className="text-center">
        <h1>My Twenty Five</h1>
      </section>
      <section>
        <div className="py-4 flex justify-center">
          <button className="p-2 flex" onClick={() => setShowModal(true)}>
            <IconPlus /> Add Movie
          </button>
        </div>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}>
          <SortableContext
            items={favorites}
            strategy={verticalListSortingStrategy}>
            {favorites.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 mb-3">
                <div className="font-bold text-lg my-2">
                  Top 10{' '}
                  <span className="text-gray-500 text-sm">
                    (Unranked, equally weighted)
                  </span>
                </div>
                {favorites
                  .filter((m, i) => i < 10)
                  .map(movie => (
                    <Draggable key={movie.id} id={movie.id}>
                      <MovieItem
                        key={`${movie.title}-${movie.id}`}
                        imageConfig={imageConfig}
                        movie={movie}
                        onRemove={onFavoriteRemove}
                        dropping={activeId === movie.id}
                      />
                    </Draggable>
                  ))}
              </div>
            )}
            {favorites.length > 10 && (
              <div className="border-2 border-gray-400 border-dashed p-3 mb-3">
                <div className="font-bold text-lg my-2">
                  Honorable Mentions{' '}
                  <span className="text-gray-500 text-sm">
                    (Unranked, weighted less than top 10)
                  </span>
                </div>
                {favorites
                  .filter((m, i) => i > 9 && i < 25)
                  .map(movie => (
                    <Draggable key={movie.id} id={movie.id}>
                      <MovieItem
                        key={`${movie.title}-${movie.id}`}
                        imageConfig={imageConfig}
                        movie={movie}
                        onRemove={onFavoriteRemove}
                        dropping={activeId === movie.id}
                      />
                    </Draggable>
                  ))}
              </div>
            )}
            {favorites.length > 25 && (
              <div className="opacity-50 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 mb-3">
                <div className="font-bold text-lg my-2">Uncounted</div>
                {favorites
                  .filter((m, i) => i > 24)
                  .map(movie => (
                    <Draggable key={movie.id} id={movie.id}>
                      <MovieItem
                        key={`${movie.title}-${movie.id}`}
                        imageConfig={imageConfig}
                        movie={movie}
                        onRemove={onFavoriteRemove}
                        dropping={activeId === movie.id}
                      />
                    </Draggable>
                  ))}
              </div>
            )}
          </SortableContext>
          <DragOverlay>
            {activeMovie ? (
              <MovieItem
                key={`${activeMovie.title}-${activeMovie.id}`}
                imageConfig={imageConfig}
                movie={activeMovie}
                dragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>
    </div>
  );
}
