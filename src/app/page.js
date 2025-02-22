'use client';

import { useSession } from '@/components/useSession';
import Link from 'next/link';
import React from 'react';

function Callout({ checkedForLogin, activeSession }) {
  if (!checkedForLogin) {
    return null;
  }

  if (!activeSession) {
    return (
      <p>Get a secure login link for your rankings by typing /my25 in Slack</p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-center">
        You are logged in as <b>{activeSession.user.username}</b>
      </p>
      <p className="border text-center p-4 border-black/[0.2] hover:border-black/[0.4] hover:bg-black/[0.05] dark:border-white/[0.2] dark:hover:border-white/[0.4] dark:hover:bg-white/[0.05] cursor-pointer transition-all rounded-md">
        <Link href={`/rankings/${activeSession.user.username}`}>
          View all of your rankings
        </Link>
      </p>
    </div>
  );
}

export default function Home() {
  const { sessionReady, session } = useSession();

  return (
    <div className="h-[400px] text-2xl flex flex-col justify-between border-red-500">
      <h1 className="font-black">twenty five films</h1>
      <p>10 favorites.</p>
      <p>15 honorable mentions.</p>
      <p>Choose your twenty five.</p>
      <Callout checkedForLogin={sessionReady} activeSession={session} />
    </div>
  );
}
