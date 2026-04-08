import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../dev.db');

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
})

export const prisma = new PrismaClient({ adapter })
