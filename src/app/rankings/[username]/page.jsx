'use client';

import React, { useState, useEffect } from 'react';
import { getSession } from '@/lib/session';
import { getRankingsForUser } from '@/lib/db';
import Link from 'next/link';

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
        console.log('retrieved rankings woot', userRankings);
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
      <h1>Rankings for {username}</h1>
      <ul>
        {rankings.map((r) => (
          <li key={r.slug}>
            <strong>
              <Link href={`/rankings/${username}/${r.slug}`}>{r.name}</Link>
            </strong>
            <br />
            <p>{r.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
