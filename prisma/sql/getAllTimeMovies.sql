SELECT 
    e.movie_id,
    m.title,
    m.release_date,
    m.poster_path,
    COUNT(CASE WHEN e.type = 'FAVORITE' THEN e.user_id END) AS favorite_count,
    COUNT(CASE WHEN e.type = 'HM' THEN e.user_id END) AS hm_count,
    COUNT(e.user_id) AS total_count
FROM "ListEntry" e
INNER JOIN "Movie" m ON e.movie_id = m.id
WHERE e.ranking_slug = 'all-time'
GROUP BY movie_id, m.title, m.release_date, m.poster_path
ORDER BY favorite_count DESC, hm_count DESC;