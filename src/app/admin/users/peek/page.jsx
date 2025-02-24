'use client';

import { AdminAuthenticatedPage } from '@/components/AuthenticatedPage';
import { Button, Typography } from '@/components/MaterialTailwind';
import useRankingForUser from '@/hooks/useRankingForUser';
import useTmdbImageConfig from '@/hooks/useTmdbImageConfig';
import { buildImageUrl } from '@/lib/buildImageUrl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AuthAdminUserPeek({ params: asyncParams }) {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const rankingSlug = searchParams.get('ranking');
  const imageConfig = useTmdbImageConfig();

  return (
    <AdminAuthenticatedPage asyncParams={asyncParams}>
      {({ session, params, router }) => {
        if (!searchParams.has('username') || !searchParams.has('ranking')) {
          return 'This page requires ?username=x&ranking=y';
        }
        return (
          <AdminUserPeek
            session={session}
            params={params}
            username={username}
            rankingSlug={rankingSlug}
            router={router}
            imageConfig={imageConfig}
          />
        );
      }}
    </AdminAuthenticatedPage>
  );
}

function AdminUserPeek({ username, rankingSlug, imageConfig }) {
  const [focusMovie, setFocusMovie] = useState(null);
  const { ranking, lists } = useRankingForUser({ username, rankingSlug });

  if (!ranking || !lists) {
    return null;
  }

  return (
    <div>
      {!focusMovie ? (
        <div>
          <div>
            <Link className="underline" href="/admin/users">
              Back to all users
            </Link>
            <h1 className="text-xl">Admin View</h1>
            <p>Ranking: {ranking.name}</p>
            <p>User: {username}</p>
          </div>
          <div className="my-5">
            <h2 className="font-bold text-lg mb-3">Favorites</h2>
            <div className="flex flex-wrap gap-4 justify-start mb-5">
              {lists.FAVORITE.map((film) => (
                <MovieGridPoster
                  key={film.id}
                  movie={film}
                  size="sm"
                  imageConfig={imageConfig}
                  setFocus={setFocusMovie}
                />
              ))}
            </div>
            <h2 className="font-bold text-lg mb-3">Honorable Mentions</h2>
            <div className="flex flex-wrap gap-2 justify-start">
              {lists.HM.map((film) => (
                <MovieGridPoster
                  key={film.id}
                  movie={film}
                  size="xs"
                  imageConfig={imageConfig}
                  setFocus={setFocusMovie}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[150px] my-5">
          <Typography className="mb-3 text-xl">
            {getMovieTitle(focusMovie)}
          </Typography>
          <Button className="w-full mb-3" onClick={() => setFocusMovie(null)}>
            Back to Ranking
          </Button>
          <img
            className="mb-3"
            alt={focusMovie.title}
            src={buildImageUrl({
              config: imageConfig,
              size: 'lg',
              path: focusMovie.poster_path
            })}
          />
        </div>
      )}
    </div>
  );
}

function MovieGridPoster({ movie, imageConfig, size, setFocus }) {
  if (!imageConfig) {
    return null;
  }

  const url = buildImageUrl({
    config: imageConfig,
    size,
    path: movie.poster_path
  });

  return (
    <img
      alt={'Poster for ' + movie.title}
      src={url}
      title={getMovieTitle(movie)}
      onClick={() => setFocus(movie)}
    />
  );
}

function getMovieTitle(movie) {
  return `${movie.title} (${new Date(movie.release_date).getFullYear()})`;
}
