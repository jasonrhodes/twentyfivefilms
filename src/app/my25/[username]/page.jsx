'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTmdbConfig } from '@/lib/getTmdbConfig';
import { AlertBox } from '@/components/AlertBox';
import { MovieLists } from './components/MovieLists';
import { ChooseMovieModal } from './components/ChooseMovieModal';
import { ImportMovies } from './components/ImportMovies';
import { INITIAL_LISTS, LIST_CONFIG } from '@/lib/constants';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { getLists } from '@/lib/db';


export default function SubmitFilms({ params }) {
  const [activeSession, setActiveSession] = useState(false);
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [listForModal, setListForModal] = useState(null);
  const [imageConfig, setImageConfig] = useState(null);
  const [alert, setAlert] = useState({});
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    async function retrieve() {
      const p = await params;
      if (!activeSession) {
        const session = await getSession();
        if (session && session?.user?.username === p.username) {
          setActiveSession(true);
        }
      }
      const config = await getTmdbConfig();
      setImageConfig(config.images);
    }

    retrieve();
  }, [setImageConfig, activeSession, setActiveSession]);

  const resetAlert = useCallback(
    (newAlert) => {
      setAlert(newAlert);
      setAlertVisible(true);
      window.setTimeout(() => setAlertVisible(false), 2000);
    },
    [setAlert, setAlertVisible]
  );

  const onMovieSelect = useCallback(
    (movie) => {
      if (!movie) {
        return;
      }

      if (lists[listForModal].some(lm => lm.id === movie.id)) {
        resetAlert({
          style: 'warning',
          message: `${movie.title} is already on ${LIST_CONFIG[listForModal].label}`
        });
      } else {
        const newLists = Object.keys(INITIAL_LISTS).reduce((result, listType) => {
          if (listType === listForModal) {
            result[listType] = [...lists[listType], movie];
            // Do we need to check for overflow here, or can we assume the UI didn't let us add a movie to a full list?
          } else {
            result[listType] = lists[listType].filter(lm => lm.id !== movie.id);
          }
          return result;
        }, INITIAL_LISTS)
        setLists(newLists);
        // TODO: update DB

        resetAlert({
          style: 'success',
          message: `${movie.title} added to ${LIST_CONFIG[listForModal].label}`
        });
        setListForModal(null);
      }
    },
    [lists, setLists, setListForModal, listForModal]
  );

  // const onImportSuccess = useCallback(
  //   (importedMovies) => {
  //     const newMovies = importedMovies.filter((importedMovie) => {
  //       return !lists.some((movie) => movie.id === importedMovie.id);
  //     });
  //
  //     const newFavourites = [...lists, ...newMovies];
  //     setLists(newFavourites);
  //     const numAdded = newMovies.length;
  //     const numSkipped = importedMovies.length - numAdded;
  //     let message = `Imported ${numAdded} new movies.`;
  //     if (numSkipped > 0) {
  //       message += ` (${numSkipped} skipped duplicates)`;
  //     }
  //     resetAlert({
  //       style: 'success',
  //       message: message
  //     });
  //   },
  //   [lists, setLists]
  // );

  const onImportFailure = useCallback((importFailureMessage) => {
    resetAlert({
      style: 'warning',
      message: importFailureMessage
    });
  });

  const onMovieRemove = useCallback(
    (movie, listType) => {
      console.log({movie, listType})
      let newLists = {...lists};
      newLists[listType] = lists[listType].filter((f) => f.id !== movie.id);
      setLists(newLists);
      resetAlert({
        style: 'danger',
        message: `${movie.title} removed from ${LIST_CONFIG[listType].label}`
      });
    },
    [lists, setLists]
  );

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

  if (!imageConfig) {
    return null
  }

  return (
    <>
      <AlertBox alert={alert} visible={alertVisible} />
      {!!listForModal ? (
        <ChooseMovieModal
          onSelect={onMovieSelect}
          imageConfig={imageConfig}
          listType={listForModal}
          closeModal={() => setListForModal(null)}
        />
      ) : (
        <MovieLists
          lists={lists}
          setLists={setLists}
          onMovieRemove={onMovieRemove}
          setListForModal={setListForModal}
          imageConfig={imageConfig}
          importMovieBox={
            <ImportMovies
              // onImportSuccess={onImportSuccess}
              // onImportFailure={onImportFailure}
            />
          }
        />
      )}
    </>
  );
}
