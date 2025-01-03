'use server';

const url =
  'https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1';

const detail_url = 'https://api.themoviedb.org/3/movie/';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
  }
};

export async function lookupMovie(pattern) {
  const urlWithPattern = url + `&query=${encodeURIComponent(pattern)}`;

  try {
    const response = await fetch(urlWithPattern, options);

    if (!response.ok) {
      throw new Error(
        `TMDB API lookup failed for pattern ${pattern} with status code ${response.status}`
      );
    }

    const parsed = await response.json();

    if (('success' in parsed && !parsed.success) || !('results' in parsed)) {
      const message =
        'status_message' in parsed
          ? parsed.status_message
          : 'Unknown error occurred while looking up movie details in TMDB';
      throw new Error(message);
    }
    return parsed.results;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function lookupMovieById(id, retries = 5) {
  const urlWithId = detail_url + `${id}`;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let attempt = 0;

  while (attempt < retries) {
    try {
      const response = await fetch(urlWithId, options);

      const parsed = await response.json();
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            `TMDB API lookup throttled for id ${id} with status code ${response.status}`
          );
        }
        throw new Error(
          `TMDB API lookup failed for id ${id} with status code ${response.status}`
        );
      }

      return parsed;
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        console.error(err);
        throw err;
      }
      const backoffTime = Math.pow(2, attempt) * 100; // Exponential backoff
      await delay(backoffTime);
    }
  }
}

export async function lookupMovies(movieIds) {
  // loop through each movie and lookup details concurrently
  const moviePromises = movieIds.map((id) => lookupMovieById(id));
  const movies = await Promise.all(moviePromises);
  return movies;
}
