import fs from 'fs';
import path from 'path';

// Parse .env.local manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.error('Failed to parse .env.local:', err);
}

// Dynamically import to ensure environment variables are set first
async function main() {
  console.log('Running setupCorsair...');
  try {
    const { corsair } = await import('./src/lib/corsair.js');
    const { setupCorsair } = await import('corsair/setup');
    const result = await setupCorsair(corsair, {
      credentials: {
        gmail: {
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
        googlecalendar: {
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        }
      }
    });
    console.log('Setup output:\n', result);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
  process.exit(0);
}

main();
