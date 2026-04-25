import 'server-only';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL or POSTGRES_URL must be set.');
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

const pool = new Pool({ connectionString: normalizePgConnectionString(connectionString) });

export const db = drizzle(pool, { schema });

export { schema };