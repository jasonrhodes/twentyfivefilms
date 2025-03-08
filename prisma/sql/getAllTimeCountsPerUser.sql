SELECT 
  le.user_id, 
  u.username, 
  u.slack_user_id, 
  le.ranking_slug,
	COUNT(CASE WHEN le.type = 'FAVORITE' THEN le.movie_id END) as favorites,
  COUNT(CASE WHEN le.type = 'HM' THEN le.movie_id END) as hms
FROM "ListEntry" le
INNER JOIN "User" u ON u.id = le.user_id
WHERE le.ranking_slug = 'all-time'
GROUP BY le.user_id, le.ranking_slug, u.username, u.slack_user_id;