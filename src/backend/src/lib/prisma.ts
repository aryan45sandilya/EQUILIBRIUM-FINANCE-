import { PrismaClient } from '@prisma/client';
import logger from './logger';

// Prevent multiple Prisma instances in development (HMR)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Prisma ${params.model}.${params.action} — ${after - before}ms`);
  }
  return result;
});
