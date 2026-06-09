import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load .env for Prisma CLI (Next.js uses .env.local which CLI doesn't read)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
