import { PrismaClient } from '@prisma/client'

declare global {
  var __db__: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const db = globalThis.__db__ ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db__ = db
}

export * from '@prisma/client'