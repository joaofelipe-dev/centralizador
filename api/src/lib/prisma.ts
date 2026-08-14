import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const url = new URL(process.env.DATABASE_URL!)

const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

const pool = new pg.Pool({
  host: url.hostname,
  port: Number(url.port),
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password,
  ssl: isLocalHost ? false : { rejectUnauthorized: false },
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
