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
  useDraggable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { IconPlus } from '@tabler/icons-react';
import { ListMovieItem } from './MovieItem';
import {COUNTED, NUM_RATED} from "@/lib/constants";

class MyMouserSensor extends MouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown',
      handler: ({ nativeEvent }) =>
        !nativeEvent.target.classList.contains('deleteButton')
    }
  ];
}

function keyCodeListener(code, func) {
  const keyFunction = (event) => {
    event.key === code && func();
  };
  document.addEventListener('keydown', keyFunction);
  return () => {
    document.removeEventListener('keydown', keyFunction);
  };
}

function Draggable(props) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.id
  });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ listStyle: 'none' }}
    >
      {props.children}
    </li>
  );
}

export function FavoriteMovieList({
  favorites,
  setFavorites,
  onFavoriteRemove,
  setShowModal,
  imageConfig
}) {
  const [activeId, setActiveId] = useState(null);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFavorites((movies) => {
        const oldIndex = movies.findIndex((movie) => movie.id === active.id);
        const newIndex = movies.findIndex((movie) => movie.id === over.id);
        return arrayMove(movies, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  const activeMovie = favorites.find((movie) => movie.id === activeId);

  const sensors = useSensors(
    useSensor(MyMouserSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8
      }
    })
  );

  useEffect(() => keyCodeListener('Enter', () => setShowModal(true)), []);

  const topTen = favorites.filter((m, i) => i < NUM_RATED);
  const honorableMentions = favorites.filter((m, i) => i >= NUM_RATED && i < COUNTED);
  const overflow = favorites.filter((m, i) => i >= COUNTED);

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
          sensors={sensors}
        >
          <SortableContext items={favorites} strategy={rectSortingStrategy}>
            <div className="flex-col md:flex-row flex gap-2">
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 flex flex-col">
                <div className="font-bold text-lg my-2">
                  Top {NUM_RATED}
                  <div className="text-gray-500 text-sm">
                    (Unranked, equally weighted)
                  </div>
                </div>
                {topTen.map((movie) => (
                  <Draggable key={movie.id} id={movie.id}>
                    <ListMovieItem
                      key={`${movie.title}-${movie.id}`}
                      imageConfig={imageConfig}
                      movie={movie}
                      onRemove={onFavoriteRemove}
                      dropping={activeId === movie.id}
                    />
                  </Draggable>
                ))}
              </div>
              <div className="flex-1 border-2 border-gray-400 border-dashed p-3 flex flex-col">
                <div className="font-bold text-lg my-2">
                  Honorable Mentions
                  <div className="text-gray-500 text-sm">
                    (
                    {honorableMentions.length === 0
                      ? `Movies will appear here when your Top ${NUM_RATED} is full. `
                      : ''}
                    Unranked, weighted less than Top {NUM_RATED})
                  </div>
                </div>
                {honorableMentions.map((movie) => (
                  <Draggable key={movie.id} id={movie.id}>
                    <ListMovieItem
                      key={`${movie.title}-${movie.id}`}
                      imageConfig={imageConfig}
                      movie={movie}
                      onRemove={onFavoriteRemove}
                      dropping={activeId === movie.id}
                    />
                  </Draggable>
                ))}
              </div>
            </div>
            {overflow.length > 0 && (
              <div className="opacity-50 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 my-2 flex flex-col">
                <div className="font-bold text-lg my-2">
                  Uncounted
                  <div className="text-gray-500 text-sm">
                    (Your Top {NUM_RATED} and 15 Honorable Mentions are full)
                  </div>
                </div>
                <div className="md:w-[50%]">
                  {overflow.map((movie) => (
                    <Draggable key={movie.id} id={movie.id}>
                      <ListMovieItem
                        key={`${movie.title}-${movie.id}`}
                        imageConfig={imageConfig}
                        movie={movie}
                        onRemove={onFavoriteRemove}
                        dropping={activeId === movie.id}
                      />
                    </Draggable>
                  ))}
                </div>
              </div>
            )}
          </SortableContext>
          <DragOverlay>
            {activeMovie ? (
              <ListMovieItem
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
