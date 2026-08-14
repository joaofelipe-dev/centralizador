import cron, { type ScheduledTask } from 'node-cron';
import { SyncAndCopyService } from './sync-and-copy.js';

const DEFAULT_CRON = '0 6 * * *';

let task: ScheduledTask | null = null;

export function startCdStockScheduler() {
  if (process.env.CD_SYNC_DISABLED === 'true') {
    console.log('[CD-SCHEDULER] Desabilitado via CD_SYNC_DISABLED');
    return;
  }

  const expression = process.env.CD_SYNC_CRON || DEFAULT_CRON;

  if (!cron.validate(expression)) {
    console.error(`[CD-SCHEDULER] Expressão CRON inválida: ${expression}`);
    return;
  }

  const service = new SyncAndCopyService();

  task = cron.schedule(expression, async () => {
    console.log(`[CD-SCHEDULER] Executando sync automática...`);
    try {
      const result = await service.execute();
      if (result.success) {
        console.log(`[CD-SCHEDULER] Sync concluída: ${result.sync?.synced} produtos sincronizados`);
      } else {
        console.error(`[CD-SCHEDULER] Sync falhou: ${result.error}`);
      }
    } catch (error) {
      console.error(`[CD-SCHEDULER] Erro na sync:`, error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });

  console.log(`[CD-SCHEDULER] Agendado: "${expression}" (America/Sao_Paulo)`);
}

export function stopCdStockScheduler() {
  if (task) {
    task.stop();
    task = null;
    console.log('[CD-SCHEDULER] Parado');
  }
}
