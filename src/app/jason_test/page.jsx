'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/lib/session';
import { getLists, saveLists } from '@/lib/db';

function shuffle(list) {
  return list
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function TestPage({ params }) {
  const [activeSession, setActiveSession] = useState(false);
  const [lists, setLists] = useState({ favorites: [], hms: [], queue: [] });
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    async function retrieve() {
      if (!activeSession) {
        const session = await getSession();
        if (session) {
          setActiveSession(session);
          const storedLists = await getLists({ user_id: session.user.id });
          setLists(storedLists);
        }
      }
    }

    retrieve();
  }, [activeSession, setActiveSession, setLists]);

  const shuffleLists = useCallback(async () => {
    const shuffled = [
      { type: 'FAVORITE', movies: shuffle(lists.favorites) },
      { type: 'HM', movies: shuffle(lists.hms) },
      { type: 'QUEUE', movies: shuffle(lists.queue) }
    ];
    console.log('shuffled lists, about to save', shuffled);

    const { saved } = await saveLists({
      user_id: activeSession.user.id,
      lists: shuffled
    });

    console.log('saved?', saved);

    setLists(saved);
  }, [lists, getLists]);

  if (!activeSession) {
    return <p>You need to be logged in as this user to view this page.</p>;
  }

  return (
    <div>
      <h1 className="mb-5">Testing Database Persistence</h1>
      <div className="mb-5">
        <p>Below, you should see your lists, as they are stored in the db.</p>
        <p>If you have no lists stored in the db, they will all be empty.</p>
      </div>
      <div>
        <OrderedMovieList title="Favorites" list={lists.favorites} />
        <OrderedMovieList title="Honorable Mentions" list={lists.hms} />
        <OrderedMovieList title="Queue" list={lists.queue} />
      </div>
      <button href="#" onClick={shuffleLists} disabled={isShuffling}>
        {isShuffling
          ? 'Re-shuffling and saving...'
          : 'Re-shuffle and save my lists!'}
      </button>
    </div>
  );
}

function OrderedMovieList({ title, list }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold mb-2">{title}</h3>
      <ol className="list-decimal mb-3">
        {list.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ol>
    </div>
  );
}
