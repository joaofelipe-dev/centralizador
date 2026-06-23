import { createRequire } from 'module';
import * as fs from 'fs';
import { prisma } from '../../lib/prisma.js';

const require = createRequire(import.meta.url);
const excel = require('xlsx');

const EXCEL_FILE_PATH = process.env.CD_EXCEL_PATH || './data/Centralizador.xlsm';
const DEFAULT_SHEET_NAME = 'Estoque CD';

interface SyncResult {
  success: boolean;
  date: string;
  column: string;
  synced: number;
  notFound: string[];
  errors: string[];
}

interface SyncLogData {
  fileName?: string;
  fileMtime?: Date;
  columnUsed?: string;
}

export class CDStockService {
  filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || EXCEL_FILE_PATH;
  }

  private normalizeName(name: string): string {
    return String(name || '').trim().toLowerCase();
  }

  private dateToExcelSerial(date: Date): number {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const dateUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return Math.floor((dateUtc.getTime() - excelEpoch.getTime()) / (24 * 60 * 60 * 1000));
  }

  private findColumnForToday(headers: any[]): { index: number; header: string } | null {
    const todaySerial = this.dateToExcelSerial(new Date());
    const today = new Date();

    for (let i = 1; i < headers.length; i++) {
      const header = headers[i];
      if (typeof header === 'number') {
        if (header === todaySerial) {
          return { index: i, header: 'today' };
        }
        const headerDate = new Date((header - 25569) * 86400 * 1000);
        if (headerDate.toDateString() === today.toDateString()) {
          return { index: i, header: 'today' };
        }
      } else if (typeof header === 'string' && header.includes(today.toISOString().split('T')[0])) {
        return { index: i, header: 'today' };
      }
    }

    for (let i = headers.length - 1; i >= 1; i--) {
      const header = headers[i];
      if (typeof header === 'number' && header > 40000 && header < 50000) {
        return { index: i, header: String(header) };
      }
    }

    return null;
  }

  private findBestSheetName(workbook: any): string | null {
    if (workbook.SheetNames.includes(DEFAULT_SHEET_NAME)) {
      return DEFAULT_SHEET_NAME;
    }
    if (workbook.SheetNames.length > 0) {
      return workbook.SheetNames[0];
    }
    return null;
  }

  private findFuzzyMatch(productName: string, stockByProduct: Map<string, number>): number | undefined {
    const normalizedName = this.normalizeName(productName);

    for (const [excelName, stockValue] of stockByProduct) {
      if (excelName.includes(normalizedName) || normalizedName.includes(excelName)) {
        return stockValue;
      }
    }
    return undefined;
  }

  async syncFromExcel(logData?: SyncLogData): Promise<SyncResult> {
    if (!fs.existsSync(this.filePath)) {
      return {
        success: false,
        date: new Date().toISOString().split('T')[0],
        column: '',
        synced: 0,
        notFound: [],
        errors: [`Arquivo não encontrado: ${this.filePath}`]
      };
    }

    const workbook = excel.readFile(this.filePath);
    const sheetName = this.findBestSheetName(workbook);

    if (!sheetName) {
      return {
        success: false,
        date: new Date().toISOString().split('T')[0],
        column: '',
        synced: 0,
        notFound: [],
        errors: ['Nenhuma planilha encontrada no arquivo']
      };
    }

    const worksheet = workbook.Sheets[sheetName];
    const json = excel.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (json.length < 2) {
      return {
        success: false,
        date: new Date().toISOString().split('T')[0],
        column: '',
        synced: 0,
        notFound: [],
        errors: ['Planilha vazia ou com dados insuficientes']
      };
    }

    const headers = json[0];
    const columnInfo = this.findColumnForToday(headers);
    if (!columnInfo) {
      return {
        success: false,
        date: new Date().toISOString().split('T')[0],
        column: '',
        synced: 0,
        notFound: [],
        errors: ['Coluna da data de hoje não encontrada']
      };
    }

    const columnIndex = columnInfo.index;

    const stockByProduct = new Map<string, number>();
    for (let i = 2; i < json.length; i++) {
      const row = json[i];
      if (!row || row.length === 0) continue;

      const productName = this.normalizeName(row[0] as string);
      if (productName) {
        let stockValue = row[columnIndex];
        if (stockValue === undefined || stockValue === null || stockValue === '') {
          stockValue = 0;
        } else if (typeof stockValue === 'string') {
          stockValue = parseFloat(stockValue.replace(',', '.')) || 0;
        } else {
          stockValue = Number(stockValue);
        }
        stockByProduct.set(productName, Math.round(Number(stockValue)));
      }
    }

    const products = await prisma.product.findMany({
      select: { id: true, name: true }
    });

    const notFound: string[] = [];
    const synced: string[] = [];
    const errors: string[] = [];

    const updatePromises = products.map(async (product) => {
      const normalizedName = this.normalizeName(product.name);
      let stockValue = stockByProduct.get(normalizedName);

      if (stockValue === undefined) {
        // ponytail: includes-based fuzzy match before giving up
        stockValue = this.findFuzzyMatch(product.name, stockByProduct);
      }

      if (stockValue === undefined) {
        notFound.push(product.name);
        return;
      }

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { stockCD: stockValue }
        });
        synced.push(product.name);
      } catch (error) {
        errors.push(`Failed to update ${product.name}: ${error}`);
      }
    });

    await Promise.all(updatePromises);

    const today = new Date().toISOString().split('T')[0];

    await prisma.syncLog.create({
      data: {
        syncedAt: new Date(),
        syncedCount: synced.length,
        fileName: logData?.fileName,
        fileMtime: logData?.fileMtime,
        columnUsed: logData?.columnUsed || columnInfo.header,
        notFound: JSON.stringify(notFound),
        errors: JSON.stringify(errors)
      }
    });

    return {
      success: errors.length === 0,
      date: today,
      column: columnInfo.header,
      synced: synced.length,
      notFound,
      errors
    };
  }
}