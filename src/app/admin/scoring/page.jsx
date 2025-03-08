'use client';

import { AdminAuthenticatedPage } from '@/components/AuthenticatedPage';
import { BasicTable } from '@/components/BasicTable';
import { Button, Typography } from '@/components/MaterialTailwind';
import useAdminAllMovies from '@/hooks/useAdminAllMovies';
import useAdminStats from '@/hooks/useAdminStats';
import useRankingForUser from '@/hooks/useRankingForUser';
import useTmdbImageConfig from '@/hooks/useTmdbImageConfig';
import { buildImageUrl } from '@/lib/buildImageUrl';
import Link from 'next/link';
import { Suspense, useState } from 'react';

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
  // const allMovies = useAdminAllMovies({ limit: 250 });

  if (!stats) {
    return null;
  }

  return (
    <div className="flex flex-col">
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
  const columns = [
    {
      key: 'title',
      label: 'Title',
      cell: (row) => {
        const releaseDate = new Date(row.release_date);
        return `${row.title} (${releaseDate.getFullYear()})`;
      }
    },
    {
      key: 'favorite_count',
      label: 'Favorites'
    },
    {
      key: 'hm_count',
      label: 'HMs'
    }
  ];

  return (
    <BasicTable
      columns={columns}
      rows={allMovies}
      options={{ getRowKey: (row) => row.movie_id }}
    />
  );
}
