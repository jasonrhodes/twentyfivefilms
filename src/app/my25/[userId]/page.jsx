'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTmdbConfig } from '@/lib/getTmdbConfig';
import { AlertBox } from '@/components/AlertBox';
import { FavoriteMovieList } from './components/FavoriteMovieList';
import { ChooseMovieModal } from './components/ChooseMovieModal';

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
        setFavorites([...favorites, movie]);
        setShowModal(false);
        resetAlert({
          style: 'success',
          message: `${movie.title} added to the list`
        });
      }
    },
    [favorites, setFavorites, setShowModal]
  );

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
        />
      )}
    </>
  );
}
