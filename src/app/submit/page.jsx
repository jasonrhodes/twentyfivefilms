'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from "next/link";
import { lookupMovie } from '@/lib/lookupMovie';
import { getTmdbConfig } from '@/lib/getTmdbConfig';
import { buildImageUrl } from '@/lib/buildImageUrl';

function Input(options) {
  const { value, label, id, onChange } = options;

  const internalOnChange = useCallback((e) => {
    const updatedValue = e.currentTarget.value;
    onChange(updatedValue);
  }, [onChange]);

  return (
    <div className="mb-10">
      <div className="pb-2"><label htmlFor={id}>{label}</label></div>
      <div>
        <input 
          className="text-black" 
          value={value} 
          onChange={internalOnChange} 
          id={id}
        />
      </div>
    </div>
  )
}

function MovieResultList({ moviePattern, onSelect, imageConfig }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let useThisResult = true;

  useEffect(() => {
    async function doAction() {
      const results = await lookupMovie(moviePattern);
      if (useThisResult) {
        setIsLoading(false);
        setMovies(results);
      }
    }

    if (moviePattern) {
      setIsLoading(true);
      doAction();
    }

    return () => (useThisResult = false);
  }, [moviePattern])

  return (
    <div>
      {isLoading ? (
        <p>Searching...</p>
        ) : (
        <ul>
          {movies.map((movie) => (
            <li key={`${movie.title}-${movie.id}`}>
              <MovieItem movie={movie} onSelect={onSelect} imageConfig={imageConfig} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MovieItem({ movie, onSelect, onRemove, imageConfig }) {

  const imageUrl = useMemo(() => buildImageUrl({
    config: imageConfig,
    size: 'xs',
    path: movie.poster_path
  }), [movie]);

  return (
    <div className="flex items-center mb-4">
      <div className="pr-3">
        <img className="w-14 h-auto" src={imageUrl} alt={`Poster for ${movie.title}`} />
      </div>
      <div className="pr-3 w-120 flex-auto">
        <b>{movie.title}</b>
        <span> </span>
        <span className="text-sm">
          ({(new Date(movie.release_date)).getFullYear()})
        </span>
      </div>
      {onSelect ? (
        <div>
          <span className="cursor-pointer" onClick={() => onSelect(movie)}>+ Select</span>
        </div>
      ) : null}
      {onRemove ? (
        <div>
          <span className="cursor-pointer" onClick={() => onRemove(movie)}>- Remove</span>
        </div>
      ) : null}
    </div>
  )
}

function ChooseMovieModal({ initialValue = '', onSelect, imageConfig }) {
  const [val, setVal] = useState(initialValue);

  const onMovieChange = useCallback((pattern) => {
    setVal(pattern);
  }, [setVal]);

  return (
    <div className="w-[500px]">
      <section className="text-center">
        <Input
          id="movie"
          label="Search for a movie"
          onChange={onMovieChange}
          value={val}
        />
      </section>
      <section>
        <MovieResultList moviePattern={val} onSelect={onSelect} imageConfig={imageConfig} />
      </section>
    </div>
  )


}

export default function SubmitFilms() {
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [imageConfig, setImageConfig] = useState(null);

  useEffect(() => {
    async function doFetch() {
      const config = await getTmdbConfig();
      setImageConfig(config.images);
    }
    doFetch();
  }, [setImageConfig]);

  const onFavoriteSelect = useCallback((movie) => {
    setFavorites([...favorites, movie]);
    setShowModal(false);
  }, [favorites, setFavorites, setShowModal]);

  const onFavoriteRemove = useCallback((movie) => {
    const updated = favorites.filter((f) => f.id !== movie.id);
    setFavorites(updated);
  }, [favorites, setFavorites]);

  return showModal ? (
    <ChooseMovieModal onSelect={onFavoriteSelect} imageConfig={imageConfig} />
  ) : (
    <div className="sm:w-[500px] flex-auto">
      <section className="text-center">
        <h1>My Favorite Movies</h1>
      </section>
      
      <section>
        <div className="pt-6 pb-6 text-center">
          <button onClick={() => setShowModal(true)}>+ Add Movie</button>
        </div>
        <ul>
          {favorites.map((movie) => <li key={`${movie.title}-${movie.id}`}>
            <MovieItem imageConfig={imageConfig} movie={movie} onRemove={onFavoriteRemove} />
          </li>)}
        </ul>
      </section>
    </div>
  );
}