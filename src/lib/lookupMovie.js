'use server'

const url = 'https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
  }
};

export async function lookupMovie(pattern) {
  const urlWithPattern = url + `&query=${encodeURIComponent(pattern)}`;
  console.log('Attempting look up for url', urlWithPattern);
  console.log('Using options', options);
  try {
    const response = await fetch(urlWithPattern, options);
    
    console.log('Response received', response.ok, response.status, response.statusText, response.headers);
    console.log(JSON.stringify(response, null, 2));

    if (!response.ok) {
      throw new Error(`TMDB API lookup failed for pattern ${pattern} with status code ${response.status}`);
    }

    const parsed = await response.json();

    if (('success' in parsed && !parsed.success) || !('results' in parsed)) {
      const message = 'status_message' in parsed ? parsed.status_message : 'Unknown error occurred while looking up movie details in TMDB';
      throw new Error(message);
    }
    return parsed.results;
  } catch (err) {
    console.error(err);
    throw err;
  }
}