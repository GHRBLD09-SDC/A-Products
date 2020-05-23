SELECT
  *
FROM products
WHERE
  id = 9345234;
SELECT
  *
FROM styles
WHERE
  product_id = 9237594;
SELECT
  s.id,
  ph.thumbnail_url,
  ph.url
FROM photos ph
INNER JOIN styles s ON (ph.style_id = s.id)
WHERE
  product_id = 9583910;
SELECT
  st.id,
  sk.skus
FROM styles st
INNER JOIN skus sk ON (st.id = sk.style_id)
WHERE
  product_id = 9582729;