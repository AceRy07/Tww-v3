import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.twwv3db_POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required for Drizzle configuration.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.twwv3db_POSTGRES_URL || 'postgres://15e1110a062bc2c53918d009d76a3b7d232d7fa963bc3fc2b0d03cc633f48ede:sk_H9xOg_4lrlImj-I-dvcQL@db.prisma.io:5432/postgres?sslmode=require',
  },
  strict: true,
  verbose: true,
});