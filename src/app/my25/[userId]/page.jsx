'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTmdbConfig } from '@/lib/getTmdbConfig';
import { AlertBox } from '@/components/AlertBox';
import { FavoriteMovieList } from './components/FavoriteMovieList';
import { ChooseMovieModal } from './components/ChooseMovieModal';
import { ImportMovies } from './components/ImportMovies';
import { COUNTED, NUM_RATED } from '@/lib/constants';

function labelFromListLength(length) {
  if (length > COUNTED) {
    return 'Uncounted';
  } else if (length > NUM_RATED) {
    return 'Honorable Mentions';
  } else {
    return `Top ${NUM_RATED}`;
  }
}

export default function SubmitFilms() {
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [imageConfig, setImageConfig] = useState(null);
  const [alert, setAlert] = useState({});
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    async function doFetch() {
      const config = await getTmdbConfig();
      setImageConfig(config.images);
    }

    doFetch();
  }, [setImageConfig]);

  const resetAlert = (newAlert) => {
    setAlert(newAlert);
    setAlertVisible(true);
    window.setTimeout(() => setAlertVisible(false), 2000);
  };

  const onFavoriteSelect = useCallback(
    (movie) => {
      if (!movie) {
        return;
      }

      if (favorites.some((fav) => fav.id === movie.id)) {
        resetAlert({
          style: 'warning',
          message: `${movie.title} is already on list`
        });
      } else {
        const newFavourites = [...favorites, movie];
        setFavorites(newFavourites);
        setShowModal(false);
        const listName = labelFromListLength(newFavourites.length);
        resetAlert({
          style: 'success',
          message: `${movie.title} added to ${listName}`
        });
      }
    },
    [favorites, setFavorites, setShowModal]
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
