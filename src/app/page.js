import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div className="h-[400px] text-2xl flex flex-col justify-between border-red-500">
      <h1 className="font-black">twenty five films</h1>
      <p>10 favorites.</p>
      <p>15 honorable mentions.</p>
      <p>Choose your twenty five.</p>
      <p className="border text-center p-4 border-black/[0.2] hover:border-black/[0.4] hover:bg-black/[0.05] dark:border-white/[0.2] dark:hover:border-white/[0.4] dark:hover:bg-white/[0.05] cursor-pointer transition-all rounded-md">
        <Link href="/login">Get Started</Link>
      </p>
    </div>
  );
}
