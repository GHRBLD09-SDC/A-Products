exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("product", (table) => {
      table.increments("id").primary();
      table.string("name");
      table.string("slogan");
      table.text("description");
      table.string("category");
      table.string("default_price");
    }),
    knex.schema.createTable("styles", (table) => {
      table.integer("id").primary().notNullable();
      table.integer("product_id").unsigned().references("product.id");
      table.string("name");
      table.string("original_price");
      table.string("sale_price");
      table.integer("default?");
    }),
    knex.schema.createTable("photos", (table) => {
      table.integer("product_id").unsigned().references("product.id");
      table.integer("style_id").unsigned().references("styles.id");
      table.string("thumbnail_url");
      table.string("url");
    }),
    knex.schema.createTable("skus", (table) => {
      table.integer("product_id").unsigned().references("product.id");
      table.integer("style_id").unsigned().references("styles.id");
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
      return Promise.all([knex.schema.dropTable("product")]);
    });
};
