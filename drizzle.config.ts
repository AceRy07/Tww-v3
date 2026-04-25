import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const drizzleDbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!drizzleDbUrl) {
  throw new Error('POSTGRES_URL is required for Drizzle configuration.');
}

function normalizePgConnectionString(urlValue: string): string {
  try {
    const url = new URL(urlValue);
    const sslmode = url.searchParams.get('sslmode');
    const useLibpqCompat = url.searchParams.get('uselibpqcompat');

    if (
      (sslmode === 'prefer' || sslmode === 'require' || sslmode === 'verify-ca') &&
      useLibpqCompat !== 'true'
    ) {
      url.searchParams.set('sslmode', 'verify-full');
    }

    return url.toString();
  } catch {
    return urlValue;
  }
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: normalizePgConnectionString(drizzleDbUrl),
  },
  strict: true,
  verbose: true,
});