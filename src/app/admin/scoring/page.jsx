'use client';

import { AdminAuthenticatedPage } from '@/components/AuthenticatedPage';
import { BasicTable } from '@/components/BasicTable';
import useAdminStats from '@/hooks/useAdminStats';
import useTmdbImageConfig from '@/hooks/useTmdbImageConfig';
import { Suspense, useEffect, useMemo, useState } from 'react';
import ManageFilters from './components/ManageFilters';
import { round } from '@/lib/round';
import ManageScoring from './components/ManageScoring';

export default function AuthAdminUserPeek({ params: asyncParams }) {
  const imageConfig = useTmdbImageConfig();

  return (
    <AdminAuthenticatedPage asyncParams={asyncParams}>
      {() => {
        return (
          <Suspense>
            <AdminScoring imageConfig={imageConfig} />
          </Suspense>
        );
      }}
    </AdminAuthenticatedPage>
  );
}

function AdminScoring({ imageConfig }) {
  const stats = useAdminStats();

  if (!stats) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-5">Scoring Sandbox</h1>
      <div>
        <Stats stats={stats} />
      </div>
      <div>
        <AllMovies allMovies={stats.movies} imageConfig={imageConfig} />
      </div>
    </div>
  );
}

function Stats({ stats }) {
  const incompleteUsers = stats.allUsers.filter((user) => {
    const count = stats.counts.find((c) => c.user_id === user.id);
    return !count || count.favorites < 10;
  });
  return (
    <div className="mb-5">
      <p>
        <b>Total users:</b> {stats.allUsers.length}
      </p>
      <p>
        <b>Fewer than 10 favorites?</b>{' '}
        {incompleteUsers.map((u) => u.username).join(', ')}
      </p>
      <p>
        <b>Average users per favorite:</b> {round(stats.avg_users_per_favorite)}
      </p>
      <p>
        <b>Average users per HM:</b> {round(stats.avg_users_per_hm)}
      </p>
    </div>
  );
}

function AllMovies({ allMovies, imageConfig }) {
  const [filteredRows, setFilteredRows] = useState([]);
  const [scoredRows, setScoredRows] = useState([]);
  const [preparedRows, setPreparedRows] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    minFavorites: 0,
    minHMs: 0
  });
  const [scoreMultipliers, setScoreMultipliers] = useState({
    favorite: 2.5,
    hm: 1
  });
  const [activeSort, setActiveSort] = useState({
    column: 'score',
    dir: 'DESC'
  });

  // apply filters whenever active filters change or if allMovies changes
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredRows(allMovies);
    } else {
      const filtered = allMovies.filter((m) => {
        return (
          m.favorite_count >= activeFilters.minFavorites &&
          m.hm_count >= activeFilters.minHMs
        );
      });
      setFilteredRows(filtered);
    }
  }, [activeFilters, allMovies]);

  // apply scoring whenever score changes or filtered rows change
  useEffect(() => {
    const scored = filteredRows.map((row) => {
      const score =
        row.favorite_count * scoreMultipliers.favorite +
        row.hm_count * scoreMultipliers.hm;
      return { ...row, score };
    });
    setScoredRows(scored);
  }, [scoreMultipliers, filteredRows]);

  // apply sorting whenever active sort changes or if scored rows change
  useEffect(() => {
    if (scoredRows.length === 0) {
      return;
    }
    const { column, dir } = activeSort;
    if (!column) {
      setPreparedRows(scoredRows);
      return;
    }
    const sorted = scoredRows.toSorted((a, b) => {
      const aSmaller = a[column] < b[column];
      return dir === 'ASC' ? (aSmaller ? -1 : 1) : aSmaller ? 1 : -1;
    });
    setPreparedRows(sorted);
  }, [activeSort, scoredRows]);

  const columns = useMemo(
    () => [
      {
        key: 'row_num',
        label: '#',
        cell: (row) => preparedRows.indexOf(row) + 1
      },
      {
        key: 'title',
        label: 'Title',
        sortable: true,
        cell: (row) => {
          const releaseDate = new Date(row.release_date);
          return (
            <div className="flex align-middle">
              <img
                alt={row.title}
                width={30}
                className="mr-3"
                src={
                  imageConfig.secure_base_url +
                  imageConfig.poster_sizes[0] +
                  row.poster_path
                }
              />
              <span className="flex flex-col justify-center">{`${row.title} (${releaseDate.getFullYear()})`}</span>
            </div>
          );
        }
      },
      {
        key: 'score',
        label: 'Score',
        sortable: true
      },
      {
        key: 'favorite_count',
        label: 'Favorites',
        sortable: true
      },
      {
        key: 'hm_count',
        label: 'HMs',
        sortable: true
      }
    ],
    [preparedRows]
  );

  return (
    <>
      <div className="flex">
        <ManageFilters
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          className="mr-3"
        />
        <ManageScoring
          scoreMultipliers={scoreMultipliers}
          setScoreMultipliers={setScoreMultipliers}
        />
      </div>
      <BasicTable
        columns={columns}
        rows={preparedRows}
        getRowKey={(row) => row.movie_id}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
      />
    </>
  );
}
