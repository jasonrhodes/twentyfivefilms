'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
  MouseSensor, closestCorners
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { ListMovieItem } from './MovieItem';
import { LIST_CONFIG } from '@/lib/constants';
import { SortableMovieList } from '@/app/my25/[username]/components/SortableMovieList';
import { MovieListType } from '@prisma/client';
import { debounceDragOver, handleDragEnd, handleDragOver, handleDragStart, moveOverflow } from '@/lib/dragAndDrop';
import { keyCodeListener } from '@/lib/keyCodeListener';

class MyMouserSensor extends MouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown',
      handler: ({ nativeEvent }) =>
        !nativeEvent.target.classList.contains('deleteButton')
    }
  ];
}

export function MovieLists({
  lists,
  setLists,
  setListForModal,
  onMovieRemove,
  imageConfig,
  importMovieBox
}) {
  const [activeId, setActiveId] = useState(null);
  const activeMovie = Object.values(lists).flat().find((movie) => movie.id === activeId);
  const [activeList, setActiveList] = useState(null)
  const [activeDropZone, setActiveDropzone] = useState(null)

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

  useEffect(() => keyCodeListener('Enter', () => {
    if (lists.FAVORITE.length < LIST_CONFIG.FAVORITE.limit) {
      setListForModal(MovieListType.FAVORITE)
    } else if (lists.HM.length < LIST_CONFIG.HM.limit) {
      setListForModal(MovieListType.HM)
    }
  }), []);

  const onAddButton = useCallback(
    (listType) => {
      setListForModal(listType);
    },
    [setListForModal]
  );

  const onRemoveButton = useCallback(
    (listType) => {
      return (movie) => onMovieRemove(movie, listType);
    },
    [onMovieRemove]
  );

  return (
    <div className="w-full flex-auto">
      <section className="text-center">
        <h1>My Twenty Five</h1>
      </section>
      <section>
        <div className="py-4 flex justify-center">{importMovieBox}</div>
      </section>
      <section>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd({event, lists, setLists, setActiveId, setActiveDropzone, setActiveList})}
          onDragStart={(event) => handleDragStart({event, setActiveId, lists, setActiveList})}
          onDragOver={debounceDragOver((event) => handleDragOver({event, lists, setLists, setActiveDropzone, setActiveList}), 10)}
          sensors={sensors}
        >
            <div className="flex-col md:flex-row flex gap-2">
              <SortableMovieList
                listType={MovieListType.FAVORITE}
                movies={lists.FAVORITE}
                onRemoveButton={onRemoveButton}
                onAddButton={onAddButton}
                activeId={activeId}
                imageConfig={imageConfig}
                isActiveDropzone={activeDropZone === MovieListType.FAVORITE}
                activeHasLeftList={activeList === MovieListType.FAVORITE && !lists.FAVORITE.some(movie => movie.id === activeId)}
                listBoxClass="flex-1 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 flex flex-col"
              />
              <SortableMovieList
                listType={MovieListType.HM}
                movies={lists.HM}
                onRemoveButton={onRemoveButton}
                onAddButton={onAddButton}
                activeId={activeId}
                imageConfig={imageConfig}
                isActiveDropzone={activeDropZone === MovieListType.HM}
                activeHasLeftList={activeList === MovieListType.HM && !lists.HM.some(movie => movie.id === activeId)}
                listBoxClass="flex-1 border-2 border-gray-400 border-dashed p-3 flex flex-col"
              />
            </div>
            <SortableMovieList
              listType={MovieListType.QUEUE}
              movies={lists.QUEUE}
              onRemoveButton={onRemoveButton}
              activeId={activeId}
              imageConfig={imageConfig}
              isActiveDropzone={activeDropZone === MovieListType.QUEUE}
              activeHasLeftList={activeList === MovieListType.QUEUE && !lists.QUEUE.some(movie => movie.id === activeId)}
              listBoxClass="opacity-50 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 my-2 flex flex-col"
              movieContainerClass="flex flex-wrap flex-row  md:justify-between"
              itemClass="flex-1 md:basis-[calc(50%-20px)] md:flex-initial"
            />
          <DragOverlay>
            {activeMovie ? (
              <ListMovieItem
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
