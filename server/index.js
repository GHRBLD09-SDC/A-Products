const { Pool } = require("pg");
let config = {
  user: "postgres",
  // password: "password",
  database: "products",
  host: "localhost",
  port: 5432,
};
const pool = new Pool(config);

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};
