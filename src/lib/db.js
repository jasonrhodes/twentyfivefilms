'use server';

import { PrismaClient, MovieListType } from '@prisma/client';
import { createHmac } from 'crypto';
import * as session from '@/lib/session';
import * as logger from './logger';
import { sanitizeUser } from './utils';

const STATIC_SECRET = 'my_secret';
const prisma = new PrismaClient();

export async function addMovieToList({ userId, movieId, type }) {
  return await prisma.moviesOnUsers.create({ data: { userId, movieId, type } });
}

export async function hashPassword(password) {
  const hmac = createHmac('sha256', STATIC_SECRET);
  hmac.update(password);
  return hmac.digest('hex');
}

export async function createUser({ username, password, slackUserId = null }) {
  const existingUser = await prisma.user.findFirst({ where: { username } });
  if (existingUser) {
    throw new Error(`User ${username} already exists`, {
      statusCode: 409,
      databaseResponse: existingUser
    });
  }

  const hashedPassword = await hashPassword(password);

  const created = prisma.user.create({
    data: {
      username,
      hashedPassword,
      slackUserId
    }
  });

  return sanitizeUser(created);
}

export async function loginUser({ username, password }) {
  logger.debug('Logging in', { username, password });
  const user = await prisma.user.findFirst({ where: { username } });
  logger.debug('Found user', { user });
  const hashedPassword = await hashPassword(password);

  if (!user || user.hashedPassword !== hashedPassword) {
    if (!user) {
      logger.debug('User was not found', username);
    } else {
      logger.debug(
        'Passwords did not match -',
        'stored:',
        user.hashedPassword,
        ' - provided:',
        hashedPassword
      );
    }
    return { error: 'LoginError', message: 'Username or password incorrect' };
  }

  const sanitizedUser = sanitizeUser(user);
  await session.setSession({ user: sanitizedUser });
  return sanitizedUser;
}

function makePassword(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_*&%^$#@!';
  const charactersLength = characters.length;
  while (result.length < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function generateAuthTokenForSlackUser({ username, slackUserId }) {
  await logger.debug(
    'Generating auth token for slack user',
    username,
    ' - ',
    slackUserId
  );

  await logger.debug(
    'Also making sure this can log more than a couple messages'
  );

  // Find this user by their slack USER ID (slack user usernames can change)
  const user = await prisma.user.findFirst({
    where: { slackUserId }
  });

  await logger.debug(
    () =>
      `Lookup for user with slackUserId ${slackUserId} complete, user is ${JSON.stringify(user)}`
  );

  if (!user) {
    const password = makePassword(28);
    await logger.debug(`User did not exist, creating new user`);
    await createUser({ username, slackUserId, password });
    await logger.debug(
      `Attempting to recreate the auth token now that the user is created`
    );
    return await generateAuthTokenForSlackUser({ username, slackUserId });
  }

  await logger.debug(`User existed, checking to make sure usernames match`);
  if (user.username !== username) {
    await logger.debug(
      `Usernames did not match, ${user.username} vs ${username}, updating record now`
    );
    try {
      await prisma.user.update({ where: { id: user.id }, data: { username } });
    } catch (error) {
      // log and swallow
      logger.error(
        `An error occurred while updating usernames that did not match ${user.username} vs. ${username}. Error message: ${error.message || error}`
      );
    }
  }

  await logger.debug(`Creating new token`);
  try {
    const token = await prisma.token.create({
      data: { userId: user.id }
    });

    await logger.debug(() => `Token created, ${JSON.stringify(token)}`);
    return token;
  } catch (error) {
    await logger.debug(() => 'Error creating new token', JSON.stringify(error));
    throw error;
  }
}

export async function getAuthTokenRecord({ token }) {
  return await prisma.token.findUnique({
    where: { id: token },
    include: {
      user: true
    }
  });
}

export async function getMoviesForUser({ userId }) {
  const movies = await prisma.moviesOnUsers.findMany({
    where: {
      userId
    },
    include: {
      movie: true
    }
  });

  const init = { favorites: [], hms: [], unused: [] };

  if (!movies) {
    return init;
  }

  return movies.reduce((results, item) => {
    switch (item.type) {
      case MovieListType.FAVORITE: {
        results.favorites.push(item.movie);
        break;
      }
      case MovieListType.HM: {
        results.hms.push(item.movie);
        break;
      }
      case MovieListType.UNUSED:
      default: {
        results.unused.push(item.movie);
      }
    }
    return results;
  }, init);
}

export async function addMovie({ userId, movie, type }) {
  const users = {
    create: [
      {
        userId,
        type
      }
    ]
  };
  await prisma.movie.upsert({
    where: {
      id: movie.id
    },
    update: {
      users
    },
    create: {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      users
    }
  });

  return await getMoviesForUser({ userId });
}
