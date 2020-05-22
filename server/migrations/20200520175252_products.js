exports.up = function (knex) {
  return Promise.all([
    // Create products table
    knex.schema.createTable("products", (table) => {
      table.increments("id").primary();
      table.string("name");
      table.string("slogan");
      table.text("description");
      table.string("category");
      table.string("default_price");
    }),
    // Create styles table
    knex.schema.createTable("styles", (table) => {
      table.integer("product_id").unsigned().references("products.id");
      table.increments("id").primary();
      table.string("name");
      table.string("original_price");
      table.string("sale_price");
      table.integer("default");
    }),
    // Create photos table
    knex.schema.createTable("photos", (table) => {
      table.increments("style_id").references("styles.id");
      table.string("thumbnail_url");
      table.string("url");
    }),
    // Create SKUs table
    knex.schema.createTable("skus", (table) => {
      table.increments("style_id").references("styles.id");
      table.jsonb("skus");
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable("skus"),
    knex.schema.dropTable("photos"),
  ])
    .then(() => {
      return Promise.all([knex.schema.dropTable("styles")]);
    })
    .then(() => {
      return Promise.all([knex.schema.dropTable("products")]);
    });
};
