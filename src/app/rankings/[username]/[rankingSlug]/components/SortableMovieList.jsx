import { ListMovieItem } from './MovieItem';
import React, { useCallback, useState } from 'react';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { LIST_CONFIG } from '@/lib/constants';

function Draggable({ id, itemClass, children }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id
  });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={itemClass}
      style={{ listStyle: 'none' }}>
      {children}
    </li>
  );
}

export function SortableMovieList({
  listType,
  movies,
  onRemoveButton,
  onAddButton,
  onClearList,
  activeId,
  imageConfig,
  listBoxClass,
  isActiveDropzone,
  activeHasLeftList,
  movieContainerClass = '',
  itemClass = ''
}) {
  const [showConfirmClearList, setShowConfirmClearList] = useState(false);
  const listConfig = LIST_CONFIG[listType];
  const { setNodeRef } = useDroppable({ id: listType });
  const listIsFull = movies.length >= listConfig.limit;
  const listIsOverflowing = movies.length > listConfig.limit;

  const onClickConfirmClearList = useCallback(() => {
    onClearList(listType);
    setShowConfirmClearList(false);
  }, [onClearList, listType, setShowConfirmClearList]);

  return (
    <SortableContext
      id={listType}
      items={movies}
      strategy={rectSortingStrategy}>
      <div
        className={`p-3 flex flex-col relative min-h-[224px] ${listBoxClass} ${listIsOverflowing ? 'bg-red-100 dark:bg-red-800' : isActiveDropzone ? 'bg-indigo-50 dark:bg-blue-950' : ''} `}>
        <div className="font-bold text-lg my-2 pr-16">
          {listConfig.label}
          {!!listConfig.description && (
            <div className="text-gray-500 text-sm min-h-[40px]">
              ({listConfig.description})
            </div>
          )}
        </div>
        <div
          className={'flex flex-row absolute right-3 justify-items-end gap-2'}>
          {!!movies.length && (
            <div
              className="cursor-pointer bg-red-100 dark:bg-red-900 hover:bg-red-700 dark:hover:bg-red-700 hover:text-white dark:text-white pr-2 pl-2 rounded-3xl deleteButton"
              onClick={() => setShowConfirmClearList(true)}>
              <span className="text-3xl leading-none pointer-events-none">
                -
              </span>
            </div>
          )}
          {!!onAddButton && !listIsFull && (
            <div
              className="cursor-pointer bg-blue-500  hover:bg-blue-700 dark:hover:bg-blue-300 pr-2 pl-2 rounded-3xl hover:text-white dark:text-white deleteButton"
              onClick={() => onAddButton(listType)}>
              <span className="text-3xl text-white leading-none pointer-events-none">
                +
              </span>
            </div>
          )}
        </div>
        <div className={movieContainerClass} ref={setNodeRef}>
          {movies.map((movie) => (
            <Draggable key={movie.id} id={movie.id} itemClass={itemClass}>
              <ListMovieItem
                key={`${movie.title}-${movie.id}`}
                imageConfig={imageConfig}
                movie={movie}
                onRemoveButton={onRemoveButton(listType)}
                dropping={activeId === movie.id}
                listIsOverflowing={listIsOverflowing}
              />
            </Draggable>
          ))}
        </div>
        {activeHasLeftList && <div className="min-h-[112px]" />}
        {showConfirmClearList && (
          <div className="bg-red-100 dark:bg-red-900 left-0 top-0 absolute w-full h-full p-3">
            <div className="font-bold text-md my-2 pr-20">
              Are you sure your want to clear your {listConfig.label}?
            </div>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => setShowConfirmClearList(false)}
                className="p-2 w-1/2 bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={onClickConfirmClearList}
                className="p-2 w-1/2 bg-red-500 hover:bg-red-800 dark:hover:bg-red-400 text-white rounded">
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </SortableContext>
  );
}
