import * as fs from 'fs';
import { FileFinderService } from './file-finder.service.js';
import { CDStockService } from './cd-stock.service.js';

const DEST_PATH = './data/Centralizador.xlsm';

interface SyncAndCopyResult {
  success: boolean;
  file?: {
    name: string;
    copiedTo: string;
    mtime: Date;
  };
  sync?: {
    synced: number;
    notFound: string[];
    errors: string[];
  };
  error?: string;
}

export class SyncAndCopyService {
  private fileFinder: FileFinderService;
  private stockService: CDStockService;

  constructor() {
    this.fileFinder = new FileFinderService();
    this.stockService = new CDStockService();
  }

  async execute(): Promise<SyncAndCopyResult> {
    console.log('[SyncAndCopy] Iniciando processo...');

    const findResult = await this.fileFinder.findFile();

    if (!findResult.success || !findResult.file) {
      return {
        success: false,
        error: findResult.error || 'Arquivo não encontrado'
      };
    }

    const sourceFile = findResult.file;
    console.log(`[SyncAndCopy] Arquivo fonte: ${sourceFile.name}`);

    if (fs.existsSync(DEST_PATH)) {
      console.log('[SyncAndCopy] Removendo arquivo existente...');
      fs.unlinkSync(DEST_PATH);
    }

    try {
      console.log('[SyncAndCopy] Copiando arquivo...');
      fs.copyFileSync(sourceFile.path, DEST_PATH);
      console.log(`[SyncAndCopy] Copiado para: ${DEST_PATH}`);

      const stats = fs.statSync(DEST_PATH);
      const fileInfo = {
        name: sourceFile.name,
        copiedTo: DEST_PATH,
        mtime: stats.mtime
      };

      console.log('[SyncAndCopy] Executando sync...');
      const syncResult = await this.stockService.syncFromExcel({
        fileName: sourceFile.name,
        fileMtime: stats.mtime
      });

      return {
        success: true,
        file: fileInfo,
        sync: {
          synced: syncResult.synced,
          notFound: syncResult.notFound,
          errors: syncResult.errors
        }
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[SyncAndCopy] Erro ao copiar: ${errMsg}`);
      return {
        success: false,
        error: errMsg
      };
    }
  }
}