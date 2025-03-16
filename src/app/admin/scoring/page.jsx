'use client';

import { AdminAuthenticatedPage } from '@/components/AuthenticatedPage';
import { BasicTable } from '@/components/BasicTable';
import useAdminStats from '@/hooks/useAdminStats';
import useTmdbImageConfig from '@/hooks/useTmdbImageConfig';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Checkbox,
  Slider,
  Input
} from '@/components/MaterialTailwind';

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
    <div className="flex flex-col max-w-full">
      <h1 className="mb-5">Scoring Sandbox</h1>
      <div>
        <Stats stats={stats} />
      </div>
      <div>
        <AllMovies allMovies={stats.movies} />
      </div>
    </div>
  );
}

function round(number, places = 1) {
  const multiplier = Math.pow(10, places);
  return Math.round(number * multiplier) / multiplier;
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

function AllMovies({ allMovies }) {
  const [filteredRows, setFilteredRows] = useState([]);
  const [preparedRows, setPreparedRows] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    minFavorites: 0,
    minHMs: 0
  });
  const [activeSort, setActiveSort] = useState({ column: null, dir: 'DESC' });

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

  // apply sorting whenever active sort changes or if filtered rows change
  useEffect(() => {
    if (filteredRows.length === 0) {
      return;
    }
    const { column, dir } = activeSort;
    if (!column) {
      setPreparedRows(filteredRows);
      return;
    }
    const sorted = filteredRows.toSorted((a, b) => {
      const aSmaller = a[column] < b[column];
      return dir === 'ASC' ? (aSmaller ? -1 : 1) : aSmaller ? 1 : -1;
    });
    setPreparedRows(sorted);
  }, [activeSort, filteredRows]);

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
          return `${row.title} (${releaseDate.getFullYear()})`;
        }
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
      <ManageFilters
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />
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

function ManageFilters({ activeFilters, setActiveFilters }) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  return (
    <>
      <div
        className="flex cursor-pointer mb-2"
        onClick={() => setManageDialogOpen(true)}>
        <IconAdjustmentsHorizontal size={24} />
        <span className="ml-1">Manage Filters</span>
      </div>
      <Dialog
        open={manageDialogOpen}
        handler={() => setManageDialogOpen(!manageDialogOpen)}>
        <DialogHeader>Manage Filters</DialogHeader>
        <DialogBody>
          <div className="mb-5">
            <Input
              type="number"
              label="Minimum Favorites Required"
              value={activeFilters.minFavorites}
              onChange={(e) =>
                setActiveFilters({
                  ...activeFilters,
                  minFavorites: Number(e.target.value)
                })
              }
            />
          </div>
          <div>
            <Input
              type="number"
              label="Minimum HMs Required"
              value={activeFilters.minHMs}
              onChange={(e) =>
                setActiveFilters({
                  ...activeFilters,
                  minHMs: Number(e.target.value)
                })
              }
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="mr-1"
            color="blue"
            onClick={() => setManageDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
