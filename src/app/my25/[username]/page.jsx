'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTmdbConfig } from '@/lib/getTmdbConfig';
import { AlertBox } from '@/components/AlertBox';
import { FavoriteMovieList } from './components/FavoriteMovieList';
import { ChooseMovieModal } from './components/ChooseMovieModal';
import { ImportMovies } from './components/ImportMovies';
import { COUNTED, NUM_RATED } from '@/lib/constants';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { MovieListType } from '@prisma/client';
import { addMovie, getMoviesForUser } from '@/lib/db';

function labelFromListLength(length) {
  if (length > COUNTED) {
    return 'Uncounted';
  } else if (length > NUM_RATED) {
    return 'Honorable Mentions';
  } else {
    return `Top ${NUM_RATED}`;
  }
}

export default function SubmitFilms({ params }) {
  const [activeSession, setActiveSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [imageConfig, setImageConfig] = useState(null);
  const [alert, setAlert] = useState({});
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    async function retrieve() {
      const p = await params;
      if (!activeSession) {
        const session = await getSession();
        if (session && session?.user?.username === p.username) {
          console.log('Setting active session lets go', session);
          setActiveSession(session);
          const movies = await getMoviesForUser({ userId: session.user.id });
          // TODO: figure out how to populate hms and unused this way
          setFavorites(movies.favorites);
        }
      }
      const config = await getTmdbConfig();
      setImageConfig(config.images);
    }

    retrieve();
  }, [setImageConfig, activeSession, setActiveSession]);

  useEffect(() => {
    console.log('favorites has changed', favorites);
  }, [favorites]);

  const onFavoriteSelect = useCallback(
    async (movie) => {
      if (!movie) {
        return;
      }

      if (favorites.some((fav) => fav.id === movie.id)) {
        resetAlert({
          style: 'warning',
          message: `${movie.title} is already on list`
        });
      } else {
        movie.release_date = new Date(movie.release_date);
        const updatedMovies = await addMovie({
          movie,
          userId: activeSession.user.id,
          // TODO: figure out how to decide which type here
          type: MovieListType.FAVORITE
        });
        console.log('updated movies, no refresh needed', updatedMovies);
        if (Array.isArray(updatedMovies.favorites)) {
          setFavorites(updatedMovies.favorites);
        } else {
          console.error('why is this not an array?');
        }

        setShowModal(false);
        resetAlert({
          style: 'success',
          // TODO: figure out how to decide which type here
          message: `${movie.title} added to ${MovieListType.FAVORITE}`
        });
      }
    },
    [favorites, setFavorites, setShowModal, activeSession]
  );

  const onImportSuccess = useCallback(
    (importedMovies) => {
      const newMovies = importedMovies.filter((importedMovie) => {
        return !favorites.some((movie) => movie.id === importedMovie.id);
      });

      const newFavourites = [...favorites, ...newMovies];
      setFavorites(newFavourites);
      const numAdded = newMovies.length;
      const numSkipped = importedMovies.length - numAdded;
      let message = `Imported ${numAdded} new movies.`;
      if (numSkipped > 0) {
        message += ` (${numSkipped} skipped duplicates)`;
      }
      resetAlert({
        style: 'success',
        message: message
      });
    },
    [favorites, setFavorites]
  );

  const onImportFailure = useCallback((importFailureMessage) => {
    resetAlert({
      style: 'warning',
      message: importFailureMessage
    });
  });

  const onFavoriteRemove = useCallback(
    (movie) => {
      const updated = favorites.filter((f) => f.id !== movie.id);
      setFavorites(updated);
      resetAlert({
        style: 'danger',
        message: `${movie.title} removed from list`
      });
    },
    [favorites, setFavorites]
  );

  const resetAlert = useCallback(
    (newAlert) => {
      setAlert(newAlert);
      setAlertVisible(true);
      window.setTimeout(() => setAlertVisible(false), 2000);
    },
    [setAlert, setAlertVisible]
  );

  console.log('main page state - favorites?', favorites);

  if (!activeSession) {
    return (
      <p>
        You need to be logged in as this user to view this page.{' '}
        <Link className="font-bold underline" href="/login">
          Login →
        </Link>
      </p>
    );
  }

  return (
    <>
      <AlertBox alert={alert} visible={alertVisible} />
      {showModal ? (
        <ChooseMovieModal
          onSelect={onFavoriteSelect}
          imageConfig={imageConfig}
          setShowModal={setShowModal}
        />
      ) : (
        <FavoriteMovieList
          favorites={favorites}
          setFavorites={setFavorites}
          onFavoriteRemove={onFavoriteRemove}
          setShowModal={setShowModal}
          imageConfig={imageConfig}
          importMovieBox={
            <ImportMovies
              onImportSuccess={onImportSuccess}
              onImportFailure={onImportFailure}
            />
          }
        />
      )}
    </>
  );
}
