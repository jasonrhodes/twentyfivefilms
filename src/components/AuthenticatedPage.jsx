'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { usePathParams } from './usePathParams';
import { useSession } from './useSession';
import * as logger from '@/lib/logger';

// valid types: session-path-match, admin
// children MUST be a function
export function AuthenticatedPage({ children, asyncParams, type }) {
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();
  const { pathParamsReady, params, user } = usePathParams({ asyncParams });
  const { sessionReady, session } = useSession();

  useEffect(() => {
    logger.debug('AUTHENTICATED PAGE: user found?', user);
  }, [user]);

  useEffect(() => {
    if (!sessionReady || !pathParamsReady) {
      logger.debug('Not ready to check auth status, exiting');
      return;
    }

    logger.debug('Checking auth status...', session);

    if (!session) {
      logger.debug('No session found, redirecting to /login');
      router.replace('/login');
      return;
    }

    logger.debug(`Logged in user: ${session.user.username}`);

    const isAdmin = session.user.role === 'ADMIN';
    logger.debug(`Logged in user role: ${session.user.role}`);

    if (!isAdmin && type === 'session-path-match') {
      if (!user) {
        logger.debug(
          'Checking for session-path-match auth but user.username is not available yet'
        );
        return;
      }
      if (session.user.username !== user.username) {
        logger.debug('Usernames do not match, redirecting to /');
        router.replace('/');
        return;
      }
    }

    if (!isAdmin && type === 'admin') {
      logger.debug('Admin auth required, user is not admin, redirecting to /');
      router.replace('/');
      return;
    }

    logger.debug('Verification complete, authentication granted');
    setIsVerifying(false);
  }, [sessionReady, pathParamsReady, user, session, type, setIsVerifying]);

  if (isVerifying) {
    return <p>Verifying authentication...</p>;
  }

  return children({ params, user, session, router });
}

export function PathAuthenticatedPage({ children, asyncParams }) {
  return (
    <AuthenticatedPage
      children={children}
      type="session-path-match"
      asyncParams={asyncParams}
    />
  );
}

export function AdminAuthenticatedPage({ children, asyncParams }) {
  return (
    <AuthenticatedPage
      children={children}
      type="admin"
      asyncParams={asyncParams}
    />
  );
}
