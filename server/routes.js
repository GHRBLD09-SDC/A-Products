let db = require("./index.js");

let queries = [
  "SELECT * FROM products WHERE id=$1",
  "SELECT * FROM styles WHERE product_id=$1",
  "SELECT s.id, ph.thumbnail_url, ph.url FROM photos ph INNER JOIN styles s ON (ph.style_id=s.id) WHERE product_id=$1",
  "SELECT st.id, sk.skus FROM styles st INNER JOIN skus sk ON (sk.style_id=s.id) WHERE product_id=$1",
];

const getProduct = (id) => {
  let details = [];
  for (let i = 0; i < queries.length; i++) {
    details.push(getPromise(queries[i], id));
  }
  return details;
};

const getPromise = (query, id) => {
  return new Promise((resolve, reject) => {
    db.query(query, [id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};

module.exports = {
  getProduct,
};
