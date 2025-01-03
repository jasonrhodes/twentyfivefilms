import { transformUrl } from '@/lib/importMovieList';
import assert from 'assert';

describe('transformUrl', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should transform the URL correctly', async () => {
    const inputUrl = 'https://letterboxd.com/bluevoid/list/top-100-2020-edition/';
    const expectedUrl = 'https://letterboxd-list-radarr.onrender.com/bluevoid/list/top-100-2020-edition';
    
    const result = await transformUrl(inputUrl);
    
    assert.strictEqual(result, expectedUrl);
  });

  it('should transform the URL correctly if it doesnt end in slash', async () => {
    const inputUrl = 'https://letterboxd.com/bluevoid/list/top-100-2020-edition';
    const expectedUrl = 'https://letterboxd-list-radarr.onrender.com/bluevoid/list/top-100-2020-edition';
    
    const result = await transformUrl(inputUrl);
    
    assert.strictEqual(result, expectedUrl);
  });

  it('should transform the URL correctly if it has extra stuff', async () => {
    const inputUrl = 'https://boxd.it/shortened';
    const resolvedUrl = 'https://letterboxd.com/bluevoid/list/top-100-2020-edition/';
    const expectedUrl = 'https://letterboxd-list-radarr.onrender.com/bluevoid/list/top-100-2020-edition';

    fetch.mockResolvedValueOnce({
      url: resolvedUrl,
      ok: true,
    });

    const result = await transformUrl(inputUrl);
    
    assert.strictEqual(result, expectedUrl);
  });

  it('should transform the shortened urls', async () => {
    const inputUrl = 'https://boxd.it/shortened';
    const resolvedUrl = 'https://letterboxd.com/bluevoid/list/top-100-2020-edition/';
    const expectedUrl = 'https://letterboxd-list-radarr.onrender.com/bluevoid/list/top-100-2020-edition';

    fetch.mockResolvedValueOnce({
      url: resolvedUrl,
      ok: true,
    });

    const result = await transformUrl(inputUrl);
    
    assert.strictEqual(result, expectedUrl);
  });

  it('should throw an error for an invalid URL', async () => {
    const inputUrl = 'invalid-url';
    
    await assert.rejects(async () => {
      await transformUrl(inputUrl);
    }, {
      name: 'Error',
      message: 'Invalid URL'
    });
  });

  it('should throw an error if resolved URL is invalid', async () => {
    const inputUrl = 'https://boxd.it/shortened';
    const resolvedUrl = 'https://invalid.com/bluevoid/list/top-100-2020-edition/';

    fetch.mockResolvedValueOnce({
      url: resolvedUrl,
      ok: true,
    });

    await assert.rejects(async () => {
      await transformUrl(inputUrl);
    }, {
      name: 'Error',
      message: 'Invalid URL'
    });
  });

});