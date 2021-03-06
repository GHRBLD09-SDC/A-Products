// Update with your config settings.

module.exports = {
  development: {
    client: "pg",
    connection: "postgres://me:password@localhost/products",
    migrations: {
      directory: __dirname + "/server/migrations",
    },
    seeds: {
      directory: __dirname + "/server/seeds/development",
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
