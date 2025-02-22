'use client';

import React, { useState, useEffect } from 'react';
import { getRankingsForUser } from '@/lib/db';
import Link from 'next/link';
import { IconStarFilled } from '@tabler/icons-react';
import { PathAuthenticatedPage } from '@/components/AuthenticatedPage';
import * as logger from '@/lib/logger';

export default function AuthMyRankings({ params: asyncParams }) {
  return (
    <PathAuthenticatedPage asyncParams={asyncParams}>
      {({ params, user, session, router }) => (
        <MyRankings
          params={params}
          user={user}
          session={session}
          router={router}
        />
      )}
    </PathAuthenticatedPage>
  );
}

function MyRankings({ user, session }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    async function retrieve() {
      logger.debug(
        'Checking for user before retrieving rankings for user',
        user
      );
      if (user) {
        const userRankings = await getRankingsForUser({
          user_id: user.id
        });
        setRankings(userRankings);
      }
    }

    retrieve();
  }, [user, setRankings]);

  if (!user) {
    return 'Loading...';
  }

  return (
    <div>
      <section className="mb-3">
        <h1>Your Rankings</h1>
        <p className="text-sm">
          You are logged in as <b>{session.user.username}</b>
        </p>
        {user.username !== session.user.username ? (
          <p className="text-sm">Viewing rankings for {user.username}</p>
        ) : null}
      </section>
      <ul>
        {rankings.map((r) => (
          <li key={r.slug} className="mb-3">
            <RankingListItemWrapper slug={r.slug}>
              <strong className="text-lg">
                <Link href={`/rankings/${user.username}/${r.slug}`}>
                  {r.name}
                </Link>
              </strong>
              <br />
              <p>{r.description}</p>
            </RankingListItemWrapper>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankingListItemWrapper({ slug, children }) {
  return (
    <>
      <div className="relative">
        {children}
        {slug === 'all-time' ? (
          <>
            <p>(This is the ranking for the All-Time Favorites Slacket.)</p>
            <IconStarFilled className="absolute top-0 -left-8 text-yellow-400" />
          </>
        ) : null}
      </div>
    </>
  );
}
