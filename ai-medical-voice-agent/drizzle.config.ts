import * as dotenv from 'dotenv';
import fs from 'fs';
console.log('📄 .env contents:\n', fs.readFileSync('.env', 'utf8'));

import path from 'path';
import { defineConfig } from 'drizzle-kit';

// 🔥 Explicitly load the .env from the project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log("✅ DATABASE_URL:", process.env.DATABASE_URL);

export default defineConfig({
  schema: './config/schema.tsx',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
