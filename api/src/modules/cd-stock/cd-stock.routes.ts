import { FastifyInstance } from 'fastify';
import { CDStockService } from './cd-stock.service.js';
import { SyncAndCopyService } from './sync-and-copy.js';
import { adminMiddleware } from '../../middlewares/auth.js';

export async function cdStockRoutes(app: FastifyInstance) {
  const cdStockService = new CDStockService();
  const syncAndCopyService = new SyncAndCopyService();

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