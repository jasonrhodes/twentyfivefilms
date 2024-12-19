'use server'

const url = 'https://api.themoviedb.org/3/configuration';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
  }
};

export async function getTmdbConfig() {
  try {
    const config = await fetch(url, options)
      .then(res => res.json());
    return config;
  } catch (err) {
    console.error('Error while fetching TMDB configuration' + err);
    throw err;
  }
}