import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { corsair } from './src/lib/corsair';
import { setupCorsair } from 'corsair/setup';

async function main() {
  console.log('Running setupCorsair...');
  try {
    const result = await setupCorsair(corsair);
    console.log('Setup output:\n', result);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
  process.exit(0);
}

main();
