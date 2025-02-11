'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/lib/session';
import { getRankingsForUser } from '@/lib/db';
import Link from 'next/link';
import { IconStarFilled } from '@tabler/icons-react';

export default function MyRankings({ params }) {
  const [username, setUsername] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    async function retrieve() {
      const p = await params;
      if (!activeSession) {
        const session = await getSession();
        if (session && session?.user?.username === p.username) {
          setUsername(p.username);
          setActiveSession(session);
        }
      }
      if (activeSession) {
        const userRankings = await getRankingsForUser({
          user_id: activeSession.user.id
        });
        setRankings(userRankings);
      }
    }

    retrieve();
  }, [activeSession, setActiveSession, getSession, setRankings]);

  if (!activeSession) {
    return 'Logging in...';
  }

  return (
    <div>
      <section className="mb-3">
        <h1>Your Rankings</h1>
        <p className="text-sm">
          You're logged in as <b>{username}</b>
        </p>
      </section>
      <ul>
        {rankings.map((r) => (
          <li key={r.slug} className="mb-3">
            <RankingListItemWrapper slug={r.slug}>
              <strong className="text-lg">
                <Link href={`/rankings/${username}/${r.slug}`}>{r.name}</Link>
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
