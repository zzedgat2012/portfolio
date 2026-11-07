import type { Core } from '@strapi/strapi';

/**
 * PostgreSQL-only database config.
 *
 * Reads all connection params from DATABASE_* env vars via env().
 * SSL is controlled by DATABASE_SSL (false in local dev, true in production).
 */
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
    },
    pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
  },
});

export default config;
