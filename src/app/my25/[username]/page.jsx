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
import { getLists, saveLists } from '@/lib/db';

export default function SubmitFilms({ params }) {
  const [activeSession, setActiveSession] = useState(null);
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
          setActiveSession(session);
          const storedLists = await getLists({ user_id: session.user.id });
          setLists(storedLists);
        }
      }
      const config = await getTmdbConfig();
      setImageConfig(config.images);
    }

    retrieve();
  }, [setImageConfig, activeSession, setActiveSession, setLists]);

  const resetAlert = useCallback(
    (newAlert) => {
      setAlert(newAlert);
      setAlertVisible(true);
      window.setTimeout(() => setAlertVisible(false), 1000);
    },
    [setAlert, setAlertVisible]
  );

  const saveListsToDb = (newLists) => {
    const listsForDb = Object.entries(newLists).map(([type, movies]) => ({type, movies}));
    saveLists({
      user_id: activeSession.user.id,
      lists: listsForDb
    });
  }

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
          } else {
            result[listType] = lists[listType].filter(lm => lm.id !== movie.id);
          }
          return result;
        }, INITIAL_LISTS)
        setLists(newLists);
        saveListsToDb(newLists);

        resetAlert({
          style: 'success',
          message: `${movie.title} added to ${LIST_CONFIG[listForModal].label}`
        });
        setListForModal(null);
      }
    },
    [lists, setLists, setListForModal, listForModal]
  );

  const onImportSuccess = useCallback(
    (importedMovies) => {
      const existingMovies = Object.values(lists).flat();
      const newMovies = importedMovies.filter((importedMovie) => {
        return !existingMovies.some((movie) => movie.id === importedMovie.id);
      });
      const numAdded = newMovies.length;
      const newLists = {...lists};

      if (lists.FAVORITE.length || lists.HM.length) {
        newLists.QUEUE = [...newLists.QUEUE, ...newMovies];
      } else {
        const newFavorites = newMovies.splice(0, LIST_CONFIG.FAVORITE.limit);
        const newHonorableMentions = newMovies.splice(0, LIST_CONFIG.HM.limit);
        newLists.FAVORITE = newFavorites;
        newLists.HM = newHonorableMentions;
        newLists.QUEUE = [...newLists.QUEUE, ...newMovies];
      }

      setLists(newLists);
      saveListsToDb(newLists);

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
    [lists, setLists]
  );

  const onImportFailure = useCallback((importFailureMessage) => {
    resetAlert({
      style: 'warning',
      message: importFailureMessage
    });
  });

  const onMovieRemove = useCallback(
    (movie, listType) => {
      let newLists = {...lists};
      newLists[listType] = lists[listType].filter((f) => f.id !== movie.id);
      setLists(newLists);
      saveListsToDb(newLists);
      resetAlert({
        style: 'danger',
        message: `${movie.title} removed from ${LIST_CONFIG[listType].label}`
      });
    },
    [lists, setLists]
  );

  const onClearList = useCallback(
    (listType) => {
      const deletedCount = lists[listType].length;
      let newLists = {
        ...lists,
        [listType]: []
      };
      setLists(newLists);
      saveListsToDb(newLists);
      resetAlert({
        style: 'danger',
        message: `${deletedCount} movies removed from ${LIST_CONFIG[listType].label}`
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
          saveListsToDb={saveListsToDb}
          onClearList={onClearList}
          resetAlert={resetAlert}
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
