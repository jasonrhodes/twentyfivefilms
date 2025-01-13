import { ListMovieItem } from '@/app/my25/[username]/components/MovieItem';
import React from 'react';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { LIST_CONFIG } from '@/lib/constants';

function Draggable({id, itemClass, children}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id
  });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={itemClass}
      style={{ listStyle: 'none' }}
    >
      {children}
    </li>
  );
}

export function SortableMovieList({
  listType,
  movies,
  onRemoveButton,
  onAddButton,
  activeId,
  imageConfig,
  listBoxClass,
  isActiveDropzone,
  activeHasLeftList,
  movieContainerClass="",
  itemClass=""
}) {
  const listConfig = LIST_CONFIG[listType];
  const { setNodeRef } = useDroppable({id: listType});
  const listIsFull = movies.length >= listConfig.limit;
  const listIsOverflowing = movies.length > listConfig.limit;
  return <SortableContext
    id={listType}
    items={movies}
    strategy={rectSortingStrategy}
  >
    <div className={`relative min-h-[224px] ${listBoxClass} ${listIsOverflowing ? 'bg-red-100 dark:bg-red-800' : isActiveDropzone ? 'bg-indigo-50 dark:bg-blue-950' : ''} `}>
      <div className="font-bold text-lg my-2 pr-12">
        {listConfig.label}
        {!!listConfig.description && <div className="text-gray-500 text-sm min-h-[40px]">
          ({listConfig.description})
        </div>}
      </div>
      {!!onAddButton && !listIsFull && <div
        className="absolute right-3 cursor-pointer bg-blue-500  hover:bg-blue-700 dark:hover:bg-blue-300 pr-2 pl-2 rounded-3xl hover:text-white dark:text-white deleteButton"
        onClick={() => onAddButton(listType)}
      >
        <span className="text-3xl text-white leading-none pointer-events-none">+</span>
      </div>}
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
      {activeHasLeftList && <div className="min-h-[112px]"/>}
    </div>
  </SortableContext>
}