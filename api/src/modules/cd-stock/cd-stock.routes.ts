import { FastifyInstance } from 'fastify';
import { CDStockService } from './cd-stock.service.js';
import { SyncAndCopyService } from './sync-and-copy.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js';
import { prisma } from '../../lib/prisma.js';

export async function cdStockRoutes(app: FastifyInstance) {
  const cdStockService = new CDStockService();
  const syncAndCopyService = new SyncAndCopyService();

  app.get('/status', {
    preHandler: authMiddleware,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            lastSync: { type: 'string', nullable: true },
            syncedCount: { type: 'number' },
            fileName: { type: 'string', nullable: true }
          }
        }
      }
    }
  }, async () => {
    const lastLog = await prisma.syncLog.findFirst({
      orderBy: { syncedAt: 'desc' }
    });

    if (!lastLog) {
      return {
        lastSync: null,
        syncedCount: 0,
        fileName: null
      };
    }

    return {
      lastSync: lastLog.syncedAt.toISOString(),
      syncedCount: lastLog.syncedCount,
      fileName: lastLog.fileName
    };
  });

  app.get('/history', {
    preHandler: adminMiddleware,
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              syncedAt: { type: 'string' },
              syncedCount: { type: 'number' },
              fileName: { type: 'string', nullable: true },
              columnUsed: { type: 'string', nullable: true }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { limit } = request.query as { limit?: string };
    const limitNum = limit ? parseInt(limit, 10) : 5;
    const logs = await prisma.syncLog.findMany({
      orderBy: { syncedAt: 'desc' },
      take: limitNum,
      select: {
        id: true,
        syncedAt: true,
        syncedCount: true,
        fileName: true,
        columnUsed: true
      }
    });

    return logs.map(log => ({
      ...log,
      syncedAt: log.syncedAt.toISOString()
    }));
  });

  app.post('/sync', {
    preHandler: adminMiddleware,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            date: { type: 'string' },
            column: { type: 'string' },
            synced: { type: 'number' },
            notFound: { type: 'array', items: { type: 'string' } },
            errors: { type: 'array', items: { type: 'string' } }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await cdStockService.syncFromExcel();
      return result;
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/sync-and-copy', {
    preHandler: adminMiddleware,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            file: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                copiedTo: { type: 'string' },
                mtime: { type: 'string' }
              }
            },
            sync: {
              type: 'object',
              properties: {
                synced: { type: 'number' },
                notFound: { type: 'array', items: { type: 'string' } },
                errors: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await syncAndCopyService.execute();
      if (!result.success) {
        return reply.status(500).send(result);
      }
      return result;
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}