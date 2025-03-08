SELECT
	AVG(user_count) AS avg_users_per_movie,
  MAX(user_count) AS max_users_per_movie
FROM (
    SELECT 
  		movie_id,
  		COUNT(user_id) AS user_count
    FROM "ListEntry"
    GROUP BY movie_id
) AS movie_user_counts;
