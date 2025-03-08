SELECT
	AVG(user_count) AS avg_users_per_hm,
  MAX(user_count) AS max_users_per_hm
FROM (
    SELECT 
  		movie_id,
  		COUNT(user_id) AS user_count
    FROM "ListEntry"
    WHERE type = 'HM'
    GROUP BY movie_id
) AS hm_user_counts;
