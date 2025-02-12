'use client';

import React, { useState } from 'react';
import { importMovieList } from '@/lib/importMovieList';
import { INVALID_URL_ERROR } from '@/lib/constants';
import { IconSquareXFilled } from '@tabler/icons-react';

export function ImportMovies({
  onImportSuccess,
  onImportFailure,
  importVisible,
  setImportVisible
}) {
  const [inputValue, setInputValue] = useState('');

  const handleImport = async () => {
    try {
      const importedMovies = await importMovieList(inputValue);
      onImportSuccess(importedMovies);
    } catch (error) {
      // check if error is due to size too large
      if (error.message.includes('Exceeded maximum')) {
        onImportFailure(error.message);
      } else if (error.message === INVALID_URL_ERROR) {
        onImportFailure(
          'The url is invalid. It must be a public Letterboxd list URL.'
        );
      } else {
        console.error('Error importing movies:', error);
      }
    }
  };

  if (!importVisible) {
    return null;
  }

  return (
    <div className="flex flex-col items-center m-2">
      <div className="flex flex-row items-center">
        <IconSquareXFilled
          className="cursor-pointer mr-1"
          onClick={() => setImportVisible(false)}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter Public Letterboxd List URL"
          className="border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 m-2 w-64 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <button
          onClick={handleImport}
          className="p-2 m-2 bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-300">
          Import
        </button>
      </div>
    </div>
  );
}
