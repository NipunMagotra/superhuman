import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { pool } from './db';

if (!process.env.CORSAIR_KEK) {
  throw new Error('Missing CORSAIR_KEK environment variable');
}

export const corsair = createCorsair({
  multiTenancy: false,
  database: pool,
  kek: process.env.CORSAIR_KEK,
  plugins: [
    gmail(),
    googlecalendar(),
  ],
});
