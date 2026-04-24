import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required for Drizzle configuration.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  strict: true,
  verbose: true,
});