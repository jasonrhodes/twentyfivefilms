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

async function resolveShortenedUrl(url) {
  const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return response.url;
}

export async function transformUrl(url) {
  // Example url: https://letterboxd.com/bluevoid/list/top-100-2020-edition/
  try {
    if (url.includes('boxd.it')) {
      const resolvedUrl = await resolveShortenedUrl(url);
      if (!resolvedUrl.includes('letterboxd.com')) {
        throw new Error('Invalid URL');
      }
      return transformUrl(resolvedUrl);
    }
    const urlParts = url.split('/');
    if (urlParts.length < 5) {
      throw new Error('Invalid URL');
    }
    const username = urlParts[3];
    const listName = urlParts[5];
    return `https://letterboxd-list-radarr.onrender.com/${username}/list/${listName}`;
  } catch {
    throw new Error('Invalid URL');
  }
}

export async function importMovieList(url) {
  try {
    const transformedUrl = await transformUrl(url);
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
