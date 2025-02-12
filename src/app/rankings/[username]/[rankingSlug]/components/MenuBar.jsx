import React, { useState } from 'react';
import Link from 'next/link';

export function MenuBar({username, onImportClick}) {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const handleImportClick = () => {
    setHamburgerOpen(false);
    onImportClick();
  }

  return (
    <div className={`fixed h-[50px] w-full top-0 left-0 z-10 bg-gray-900 flex items-center justify-center`}>
      <div className={`w-full h-full lg:w-[960px]`}>
        <div className={`flex text-gray-200 sm:hidden w-[50px] p-3 border-l-2 border-r-2 border-gray-800 ${hamburgerOpen ? 'bg-gray-800' : ''}`}
             onClick={() => setHamburgerOpen(!hamburgerOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 6l16 0" />
            <path d="M4 12l16 0" />
            <path d="M4 18l16 0" />
          </svg>
        </div>
        <div className={`sm:h-full sm:flex sm:pl-5 ${hamburgerOpen ? 'top-[48px] fixed h-[100px] flex flex-col bg-gray-800 border-b-2 border-gray-600' : 'hidden'}`}>
          <Link
            href={`/rankings/${username}`}
            className={"sm:text-center sm:align-middle text-gray-200 h-full p-3 hover:bg-gray-800 border-l-2 border-gray-800"}
          >
            My Rankings
          </Link>
          <div
            onClick={handleImportClick}
            className={"sm:text-center sm:align-middle text-gray-200 h-full p-3 hover:bg-gray-800 border-l-2 border-r-2 border-gray-800 cursor-pointer"}
          >
            Import From Letterboxd
          </div>
        </div>

      </div>
    </div>
  );
}
