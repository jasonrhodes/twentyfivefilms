'use client';

import { useState, useEffect } from 'react';
import { INITIAL_LISTS } from '@/lib/constants';
import { getListsForUserRanking, getRankingDetailsFromSlug } from '@/lib/db';
import * as logger from '@/lib/logger';

export default function useRankingForUser({ userId, username, rankingSlug }) {
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    async function retrieve() {
      logger.debug('retrieving ranking details and stored lists');

      if (!rankingSlug || (!userId && !username)) {
        return;
      }

      const rankingDetails = await getRankingDetailsFromSlug(rankingSlug);
      if (!rankingDetails || !rankingDetails.slug) {
        return;
      }
      setRanking(rankingDetails);

      const storedLists = await getListsForUserRanking({
        user_id: userId,
        username,
        ranking_slug: rankingSlug
      });
      setLists(storedLists);
    }

    retrieve();
  }, [userId, username, rankingSlug, setLists, setRanking]);

  return { lists, ranking };
}
