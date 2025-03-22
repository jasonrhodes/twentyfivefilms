'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertBox } from '@/components/AlertBox';
import { MovieLists } from './components/MovieLists';
import { ChooseMovieModal } from './components/ChooseMovieModal';
import { ImportMovies } from './components/ImportMovies';
import { INITIAL_LISTS, LIST_CONFIG } from '@/lib/constants';
import {
  getListsForUserRanking,
  saveLists,
  getRankingDetailsFromSlug
} from '@/lib/db';
import { MenuBar } from '@/components/MenuBar';
import { PathAuthenticatedPage } from '@/components/AuthenticatedPage';
import useTmdbImageConfig from '@/hooks/useTmdbImageConfig';

export default function AuthRankingPage({ params: asyncParams }) {
  return (
    <PathAuthenticatedPage asyncParams={asyncParams}>
      {({ params, user, session, router }) => (
        <RankingPage
          params={params}
          user={user}
          session={session}
          router={router}
        />
      )}
    </PathAuthenticatedPage>
  );
}

function RankingPage({ params, user, session, router }) {
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [ranking, setRanking] = useState(null);
  const [listForModal, setListForModal] = useState(null);
  const [alert, setAlert] = useState({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);

  const imageConfig = useTmdbImageConfig();

  useEffect(() => {
    async function retrieve() {
      if (!session || !user || !params) {
        return;
      }

      const rankingDetails = await getRankingDetailsFromSlug(
        params.rankingSlug
      );
      if (!rankingDetails || !rankingDetails.slug) {
        // not a valid ranking slug
        router.replace(`/rankings/${user.username}`);
      }
      setRanking(rankingDetails);

      const storedLists = await getListsForUserRanking({
        user_id: user.id,
        ranking_slug: params.rankingSlug
      });
      setLists(storedLists);
    }

    retrieve();
  }, [params, user, session, router, setLists, setRanking]);

  const resetAlert = useCallback(
    (newAlert) => {
      setAlert(newAlert);
      setAlertVisible(true);
      window.setTimeout(() => setAlertVisible(false), 1000);
    },
    [setAlert, setAlertVisible]
  );

  const saveListsToDb = useCallback(
    (newLists) => {
      const listsForDb = Object.entries(newLists).map(([type, movies]) => ({
        type,
        movies
      }));
      saveLists({
        user_id: user.id,
        ranking_slug: ranking.slug,
        lists: listsForDb
      });
    },
    [user, ranking]
  );

  const onMovieSelect = useCallback(
    (movie) => {
      if (!movie) {
        return;
      }

      if (lists[listForModal].some((lm) => lm.id === movie.id)) {
        resetAlert({
          style: 'warning',
          message: `${movie.title} is already on ${LIST_CONFIG[listForModal].label}`
        });
      } else {
        const newLists = Object.keys(INITIAL_LISTS).reduce(
          (result, listType) => {
            if (listType === listForModal) {
              result[listType] = [...lists[listType], movie];
            } else {
              result[listType] = lists[listType].filter(
                (lm) => lm.id !== movie.id
              );
            }
            return result;
          },
          INITIAL_LISTS
        );
        setLists(newLists);
        saveListsToDb(newLists);

        resetAlert({
          style: 'success',
          message: `${movie.title} added to ${LIST_CONFIG[listForModal].label}`
        });
        setListForModal(null);
      }
    },
    [lists, saveListsToDb, setLists, setListForModal, listForModal, resetAlert]
  );

  const onImportSuccess = useCallback(
    (importedMovies) => {
      const existingMovies = Object.values(lists).flat();
      const newMovies = importedMovies.filter((importedMovie) => {
        return !existingMovies.some((movie) => movie.id === importedMovie.id);
      });
      const numAdded = newMovies.length;
      const newLists = { ...lists };

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

      setImportVisible(false);
    },
    [lists, setLists, saveListsToDb, resetAlert]
  );

  const onImportFailure = useCallback(
    (importFailureMessage) => {
      resetAlert({
        style: 'warning',
        message: importFailureMessage
      });
    },
    [resetAlert]
  );

  const onMovieRemove = useCallback(
    (movie, listType) => {
      let newLists = { ...lists };
      newLists[listType] = lists[listType].filter((f) => f.id !== movie.id);
      setLists(newLists);
      saveListsToDb(newLists);
      resetAlert({
        style: 'danger',
        message: `${movie.title} removed from ${LIST_CONFIG[listType].label}`
      });
    },
    [lists, setLists, saveListsToDb, resetAlert]
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
    [lists, setLists, saveListsToDb, resetAlert]
  );

  if (!ranking || !lists || !imageConfig) {
    return (
      <div className="text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-auto pt-[50px]">
      <MenuBar
        user={session.user}
        onImportClick={() => setImportVisible(!importVisible)}
        lists={lists}
        ranking={ranking}
      />
      <AlertBox alert={alert} visible={alertVisible} />
      <section className="text-center">
        <h1>{ranking ? ranking.name : 'Loading...'}</h1>
      </section>

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
              importVisible={importVisible}
              setImportVisible={setImportVisible}
            />
          }
        />
      )}
    </div>
  );
}
