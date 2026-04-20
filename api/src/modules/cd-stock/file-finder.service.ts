import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_NETWORK_PATH = '\\\\192.168.0.247\\onedrive\\Consolidado'; 

interface FileInfo {
  name: string;
  path: string;
  mtime: Date;
}

interface FindResult {
  success: boolean;
  file?: FileInfo;
  error?: string;
}

export class FileFinderService {
  private networkPath: string;

  constructor(networkPath?: string) {
    this.networkPath =
      networkPath ||
      process.env.CD_NETWORK_PATH ||
      DEFAULT_NETWORK_PATH;
  }

  private getSemanaAtual(): number {
    const hoje = new Date();
    return Math.ceil(hoje.getDate() / 7);
  }

  private getSemanas(): number[] {
    const atual = this.getSemanaAtual();
    const semanas: number[] = [];

    for (let i = atual; i >= 1; i--) {
      semanas.push(i);
    }

    return semanas;
  }

  private getMesesPattern(): string[] {
    return [
      'Janeiro','Jan','Fevereiro','Fev','Março','Mar',
      'Abril','Abr','Maio','Mai','Junho','Jun',
      'Julho','Jul','Agosto','Ago','Setembro','Set',
      'Outubro','Out','Novembro','Nov','Dezembro','Dez'
    ];
  }

  private buildSearchPatterns(semanas: number[]): string[] {
    const meses = this.getMesesPattern();
    const ano = new Date().getFullYear();

    const padroes: string[] = [];

    for (const semana of semanas) {
      for (const mes of meses) {
        padroes.push(`Centralizador ${semana} Sem ${mes}.*${ano}.*\\.xlsm`);
      }
      padroes.push(`Centralizador ${semana} Sem .*\\.xlsm`);
    }

    padroes.push(`Centralizador.*\\.xlsm`);

    return padroes.map(p => new RegExp(`^${p}$`, 'i').source);
  }

  private listFilesInDirectory(dirPath: string): FileInfo[] {
    const files: FileInfo[] = [];

    console.log(`[FileFinder] Lendo diretório: ${dirPath}`);

    if (!fs.existsSync(dirPath)) {
      console.error(`[FileFinder] ❌ Diretório não existe`);
      return files;
    }

    const fileNames = fs.readdirSync(dirPath);

    for (const fileName of fileNames) {
      if (!fileName.toLowerCase().endsWith('.xlsm')) continue;

      const fullPath = path.join(dirPath, fileName);

      try {
        const stats = fs.statSync(fullPath);

        files.push({
          name: fileName,
          path: fullPath,
          mtime: stats.mtime
        });
      } catch (err) {
        console.error(`[FileFinder] Erro ao ler arquivo: ${fileName}`);
      }
    }

    return files;
  }

  async findFile(): Promise<FindResult> {
    const semanas = this.getSemanas();
    const padroes = this.buildSearchPatterns(semanas);

    console.log(`[FileFinder] Path: ${this.networkPath}`);

    const files = this.listFilesInDirectory(this.networkPath);

    console.log(`[FileFinder] ${files.length} arquivos encontrados`);

    if (files.length === 0) {
      return { success: false, error: 'Nenhum arquivo encontrado' };
    }

    for (const padrao of padroes) {
      const regex = new RegExp(padrao, 'i');
      const matches = files.filter(f => regex.test(f.name));

      if (matches.length > 0) {
        matches.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

        return {
          success: true,
          file: matches[0]
        };
      }
    }

    return {
      success: false,
      error: 'Nenhum padrão correspondente'
    };
  }
}