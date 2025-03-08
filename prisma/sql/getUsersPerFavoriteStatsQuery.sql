SELECT
	AVG(user_count) AS avg_users_per_favorite,
  MAX(user_count) AS max_users_per_favorite
FROM (
    SELECT 
  		movie_id,
  		COUNT(user_id) AS user_count
    FROM "ListEntry"
    WHERE type = 'FAVORITE'
    GROUP BY movie_id
) AS favorite_user_counts;
