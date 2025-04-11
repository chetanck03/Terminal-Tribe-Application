import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client for Supabase PostgreSQL
 * 
 * This implementation creates a singleton instance of PrismaClient
 * with configuration optimized for Supabase's connection pooling
 */

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global;

// Configure client with connection pooling settings for Supabase
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
    // Reduce logging in production
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Connection pooling settings
    // The Supabase connection pool is already managed on their side
    // so we need to use minimal connections from our app
    __internal: {
      engine: {
        connectionLimit: 1, // Minimal connections as Supabase handles pooling
      }  
    }
  });
};

// Export singleton instance
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Attach to global object in non-production environments
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 