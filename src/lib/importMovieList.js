'use server';
import { lookupMovies } from './lookupMovie';
import { MAX_IMPORT_COUNT } from '@/lib/constants';
import { ImportTooLargeError } from '@/lib/errors';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
};

function transformUrl(url) {
  try {
    const urlParts = url.split('/');
    const username = urlParts[urlParts.length - 4];
    const listName = urlParts[urlParts.length - 2];
    return `https://letterboxd-list-radarr.onrender.com/${username}/list/${listName}`;
  } catch {
    throw new Error('Invalid List URL');
  }
}

export async function importMovieList(url) {
  try {
    const transformedUrl = transformUrl(url);
    const response = await fetch(transformedUrl, options);

    if (!response.ok) {
      throw new Error(`Import failed with status code ${response.status}`);
    }

    const parsed = await response.json();
    const movieIds = parsed.map((movie) => movie.id);

    if (movieIds.length > MAX_IMPORT_COUNT) {
      throw new ImportTooLargeError(
        `Import failed. Exceeded maximum import count of ${MAX_IMPORT_COUNT}`
      );
    }
    const movies = await lookupMovies(movieIds);
    return movies;
  } catch (err) {
    if (!(err instanceof ImportTooLargeError)) {
      // Import too large error will be handled as a warning
      console.error(err);
    }
    throw err;
  }
}
