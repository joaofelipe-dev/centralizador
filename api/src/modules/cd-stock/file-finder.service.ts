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
    this.networkPath = networkPath || process.env.CD_NETWORK_PATH || DEFAULT_NETWORK_PATH;
  }

  private getSemanaAtual(): number {
    const hoje = new Date();
    const dia = hoje.getDate();
    return Math.ceil(dia / 7);
  }

  private getSemanasAnteriores(): number[] {
    const semanas: number[] = [];
    for (let i = 5; i >= 1; i--) {
      semanas.push(i);
    }
    return semanas;
  }

  private getMesesPattern(): string[] {
    return [
      'Janeiro', 'Jan',
      'Fevereiro', 'Fev',
      'Março', 'Mar',
      'Abril', 'Abr',
      'Maio', 'Mai',
      'Junho', 'Jun',
      'Julho', 'Jul',
      'Agosto', 'Ago',
      'Setembro', 'Set',
      'Outubro', 'Out',
      'Novembro', 'Nov',
      'Dezembro', 'Dez'
    ];
  }

  private buildSearchPatterns(semanas: number[]): string[] {
    const meses = this.getMesesPattern();
    const ano = new Date().getFullYear();
    const anoStr = String(ano);

    const padroes: string[] = [];

    for (const semana of semanas) {
      for (const mes of meses) {
        padroes.push(`Centralizador ${semana} Sem ${mes}*${anoStr}*.xlsm`);
      }
      padroes.push(`Centralizador ${semana} Sem *.xlsm`);
    }

    padroes.push(`Centralizador*.xlsm`);

    return padroes;
  }

  private listFilesInDirectory(dirPath: string): FileInfo[] {
    const files: FileInfo[] = [];

    try {
      if (!fs.existsSync(dirPath)) {
        return files;
      }

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.xlsm')) {
          const fullPath = path.join(dirPath, entry.name);
          const stats = fs.statSync(fullPath);
          files.push({
            name: entry.name,
            path: fullPath,
            mtime: stats.mtime
          });
        }
      }
    } catch (error) {
      console.error(`[FileFinder] Erro ao listar diretório ${dirPath}:`, error);
    }

    return files;
  }

  async findFile(): Promise<FindResult> {
    const semanas = this.getSemanasAnteriores();
    const padroes = this.buildSearchPatterns(semanas);

    console.log(`[FileFinder] Buscando arquivo para semanas ${semanas.join(', ')}`);
    console.log(`[FileFinder] Path: ${this.networkPath}`);

    try {
      const files = this.listFilesInDirectory(this.networkPath);

      console.log(`[FileFinder] Arquivos encontrados: ${files.length}`);
      for (const f of files) {
        console.log(`[FileFinder] - ${f.name}`);
      }

      if (files.length === 0) {
        return { success: false, error: 'Nenhum arquivo encontrado na pasta' };
      }

      for (const padrao of padroes) {
        const regex = this.patternToRegex(padrao);
        const matches = files.filter(f => regex.test(f.name));

        if (matches.length > 0) {
          console.log(`[FileFinder] Pattern "${padrao}" matched: ${matches[0].name}`);
          matches.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
          const maisRecente = matches[0];

          console.log(`[FileFinder] Arquivo encontrado: ${maisRecente.name}`);
          console.log(`[FileFinder] Modificado em: ${maisRecente.mtime}`);

          return {
            success: true,
            file: maisRecente
          };
        }
      }

      return { success: false, error: 'Nenhum arquivo com padrão correspondente' };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[FileFinder] Erro: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`, 'i');
  }
}