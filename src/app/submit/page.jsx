'use client'

import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import { lookupMovie } from '@/lib/lookupMovie';
import { getTmdbConfig } from '@/lib/getTmdbConfig';
import { buildImageUrl } from '@/lib/buildImageUrl';
import { Input } from '@/components/MyInput';
import {CSS} from '@dnd-kit/utilities';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  KeyboardSensor,
  TouchSensor

} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { IconPlus, IconX } from '@tabler/icons-react';
class MyMouserSensor extends MouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown',
      handler: ({nativeEvent}) => !nativeEvent.target.classList.contains('deleteButton')
    },
  ];
}

function MovieResultList({
  movies, 
  onSelect, 
  imageConfig, 
  selectedIndex, 
  setSelectedIndex,
  disableHoverSelect
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
            <li key={`${movie.title}-${movie.id}`} onMouseEnter={(e) => handleHover(e, i)}>
              <MovieItem movie={movie} onSelect={onSelect} imageConfig={imageConfig} selected={i === selectedIndex}/>
            </li>
          ))}
        </ul>
    </div>
  )
}

function MovieItem({ movie, onSelect, onRemove, imageConfig, selected, dragging, dropping }) {
  const [deleteStyle, setDeleteStyle] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (selected) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selected])

  const imageUrl = useMemo(() => movie.poster_path ? buildImageUrl({
    config: imageConfig,
    size: 'xs',
    path: movie.poster_path
  }) : null, [movie]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: movie.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const actionStyle = onSelect ? 'cursor-pointer' : 'cursor-move'
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
    <div className={`flex items-center mb-4 ${actionStyle} ${backgroundColor} sm:pr-2`} onClick={() => onSelect ? onSelect(movie) : null} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div ref={scrollRef} className="h-24 bg-gray-200 dark:bg-gray-800 flex justify-center align-middle items-center" style={{flex: '0 0 4rem'}}>
        {dropping ? <span className="bg-indigo-100 dark:bg-blue-900 w-full h-full"></span> :
            imageUrl ? <img className="w-full h-full" src={imageUrl}/> :
                <span className="text-2xl text-gray-400 dark:text-gray-600">?</span>
        }
      </div>
      <div className="pr-3 pl-3 w-full flex-auto">
        {dropping ?
            <b>Drop Here</b> :
            <>
              <b>{movie.title}</b>
              <span> </span>
              <span className="text-sm">
                ({movie.release_date ? (new Date(movie.release_date)).getFullYear() : '?'})
              </span>
            </>}
      </div>
      {onRemove && !dropping ? (
          <div className="cursor-pointer bg-red-100 dark:bg-red-900 hover:bg-red-700 dark:hover:bg-red-700 pr-2 pl-2 rounded-2xl hover:text-white dark:text-white deleteButton" onMouseEnter={() => setDeleteStyle(true)} onMouseLeave={() => setDeleteStyle(false)} onClick={() => onRemove(movie)}>
            <span className="text-2xl leading-none pointer-events-none">-</span>
          </div>
      ) : null}
    </div>
  )
}



function ChooseMovieModal({ initialValue = '', onSelect, imageConfig, setShowModal }) {
  const [val, setVal] = useState(initialValue);
  const [movies, setMovies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [disableHoverSelect, setDisableHoverSelect] = useState(false);
  const ref = useRef()

  const onMovieChange = useCallback((pattern) => {
    setVal(pattern);
  }, [setVal]);

  const cancelSearch = useCallback(() => setShowModal(false), [setShowModal]);

  const onKeyDown = useCallback((event) => {
    if (event.code === 'ArrowUp') {
      event.preventDefault();
      setDisableHoverSelect(true);
      setSelectedIndex(selectedIndex === 0 ? 0 : selectedIndex - 1)
    } else if (event.code === 'ArrowDown') {
      event.preventDefault();
      setDisableHoverSelect(true);
      setSelectedIndex(selectedIndex === movies.length - 1 ? 0 : selectedIndex + 1)
    } else if (event.code === 'Enter') {
      event.preventDefault();
      setDisableHoverSelect(false);
      onSelect(movies[selectedIndex], true)
    } else if (event.code === 'Escape') {
      event.preventDefault();
      setDisableHoverSelect(false);
      cancelSearch();
    } else {
      setDisableHoverSelect(false);
      setSelectedIndex(0);
    }
  });

  useEffect(() => {
    if (ref?.current) {
      ref.current.focus();
    }
  }, [ref]);

  let useThisResult = true;

  useEffect(() => {
    async function doAction() {
      const results = await lookupMovie(val);
      if (useThisResult) {
        setMovies(results);
      }
    }

    if (val) {
      doAction();
    }

    return () => (useThisResult = false);
  }, [val])

  return (
    <div className="w-full">
      <div className="pt-4 pb-6 flex justify-end">
        <button className="p-2 flex" onClick={cancelSearch}><IconX /></button>
      </div>
      <section className="text-center">
        <Input
          id="movie"
          label="Search for a movie"
          onChange={onMovieChange}
          value={val}
          ref={ref}
          onKeyDown={onKeyDown}
        />
      </section>
      <section>
        <MovieResultList
          movies={movies}
          onSelect={onSelect}
          imageConfig={imageConfig} 
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          disableHoverSelect={disableHoverSelect}
        />
      </section>
    </div>
  )
}

function FavoriteMovieList({favorites, setFavorites, onFavoriteRemove, setShowModal, imageConfig}) {
  const [activeId, setActiveId] = useState(null);

  const handleDragEnd = (event) => {
    const {active, over} = event;
    if (active.id !== over.id) {
      setFavorites((movies) => {
        const oldIndex = movies.findIndex(movie => movie.id === active.id);
        const newIndex = movies.findIndex(movie => movie.id === over.id);

        return arrayMove(movies, oldIndex, newIndex);
      });
    }
    setActiveId(null)
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  const activeMovie = favorites.find(movie => movie.id === activeId)

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
  )

  useEffect(() => keyCodeListener('Enter', () => setShowModal(true)),[])

  return <div className="w-full flex-auto">
    <section className="text-center">
      <h1>My Favorite Movies</h1>
    </section>
    <section>
      <div className="py-4 flex justify-center">
        <button className="p-2 flex" onClick={() => setShowModal(true)}><IconPlus /> Add Movie</button>
      </div>
      <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
      >
        <SortableContext
            items={favorites}
            strategy={verticalListSortingStrategy}
        >
          {favorites.length > 0 && <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 mb-3">
            <div className="font-bold text-lg my-2">Top 10 <span className="text-gray-500 text-sm">(Unranked, equally weighted)</span></div>
            {favorites.filter((m, i) => i < 10).map((movie) => <Draggable key={movie.id} id={movie.id}>
                  <MovieItem key={`${movie.title}-${movie.id}`} imageConfig={imageConfig} movie={movie}
                             onRemove={onFavoriteRemove} dropping={activeId === movie.id}/>
                </Draggable>
            )}
          </div>}
          {favorites.length > 10 && <div className="border-2 border-gray-400 border-dashed p-3 mb-3">
            <div className="font-bold text-lg my-2">Honorable Mentions <span className="text-gray-500 text-sm">(Unranked, weighted less than top 10)</span></div>
            {favorites.filter((m, i) => i > 9 && i < 25).map((movie) => <Draggable key={movie.id} id={movie.id}>
                  <MovieItem key={`${movie.title}-${movie.id}`} imageConfig={imageConfig} movie={movie}
                             onRemove={onFavoriteRemove} dropping={activeId === movie.id}/>
                </Draggable>
            )}
          </div>}
          {favorites.length > 25 && <div className="opacity-50 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed p-3 mb-3">
            <div className="font-bold text-lg my-2">Uncounted</div>
            {favorites.filter((m, i) => i > 24).map((movie) => <Draggable key={movie.id} id={movie.id}>
                  <MovieItem key={`${movie.title}-${movie.id}`} imageConfig={imageConfig} movie={movie}
                             onRemove={onFavoriteRemove} dropping={activeId === movie.id}/>
                </Draggable>
            )}
          </div>}
        </SortableContext>
        <DragOverlay>
          {activeMovie ? (
              <MovieItem key={`${activeMovie.title}-${activeMovie.id}`} imageConfig={imageConfig} movie={activeMovie}
                         dragging={true}/>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  </div>
}

export default function SubmitFilms() {
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [imageConfig, setImageConfig] = useState(null);
  const [alert, setAlert] = useState({})
  const [alertVisible, setAlertVisible] = useState(false)

  useEffect(() => {
    async function doFetch() {
      const config = await getTmdbConfig();
      setImageConfig(config.images);
    }

    doFetch();
  }, [setImageConfig]);

  const resetAlert = (newAlert) => {
    setAlert(newAlert)
    setAlertVisible(true)
    window.setTimeout(() => setAlertVisible(false),2000)
  }

  const onFavoriteSelect = useCallback((movie, enterSelect = false) => {
    if (favorites.some(fav => fav.id === movie.id)) {
      resetAlert({style: 'warning', message: `${movie.title} is already on list`})
    } else {
      setFavorites([...favorites, movie]);
      setShowModal(false);
      resetAlert({style: 'success', message: `${movie.title} added to the list`})
    }
  }, [favorites, setFavorites, setShowModal]);

  const onFavoriteRemove = useCallback((movie) => {
    const updated = favorites.filter((f) => f.id !== movie.id);
    setFavorites(updated);
    resetAlert({style: 'danger', message: `${movie.title} removed from list`})
  }, [favorites, setFavorites]);

  return <>
    <AlertBox alert={alert} visible={alertVisible} />
    {showModal ?
        <ChooseMovieModal onSelect={onFavoriteSelect} imageConfig={imageConfig} setShowModal={setShowModal}/>
     : <FavoriteMovieList favorites={favorites} setFavorites={setFavorites} onFavoriteRemove={onFavoriteRemove} setShowModal={setShowModal} imageConfig={imageConfig} />
    }
  </>;
}

function Draggable(props) {
  const {attributes, listeners, setNodeRef} = useDraggable({
    id: props.id,
  });

  return (
      <li ref={setNodeRef} {...listeners} {...attributes} style={{listStyle: 'none'}}>
        {props.children}
      </li>
  );
}

function keyCodeListener(code, func) {
  const keyFunction = (event) => {
    event.key === code && func()
  };
  document.addEventListener("keydown", keyFunction);
  return () => {
    document.removeEventListener("keydown", keyFunction);
  }
}

function AlertBox({alert: {message, style}, visible}) {
  const styleClass = style === 'success' ? 'bg-green-300 dark:bg-green-800 border-green-500 dark:green-yellow-600' : style === 'warning' ? 'bg-yellow-300 dark:bg-yellow-800 border-yellow-500 dark:border-yellow-600' : style === 'danger' ? 'bg-red-300 dark:bg-red-800 border-red-500 dark:border-red-600' : 'bg-white border-gray-500 dark:bg-black'
  const transitionStyle = visible ? {transition: 'top 0.5s ease 0s', top: '-2px'} : {transition: 'top 0.2s ease 0s'}
  return <div className={`border-2 p-2 fixed h-[50px] top-[-50px] ${styleClass}`} style={transitionStyle}>
    {message}
  </div>

}