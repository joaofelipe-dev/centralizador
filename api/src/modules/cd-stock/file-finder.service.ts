import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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
      const escapedPath = dirPath.replace(/\\/g, '\\\\');
      const cmd = `cmd /c dir "${escapedPath}\\*.xlsm" /b`;
      
      const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      
      const lines = output.split('\n').map(l => l.trim()).filter(l => l && l.endsWith('.xlsm'));
      
      for (const fileName of lines) {
        const fullPath = path.join(dirPath, fileName);
        try {
          const stats = fs.statSync(fullPath);
          files.push({
            name: fileName,
            path: fullPath,
            mtime: stats.mtime
          });
        } catch {
          const cmdMtime = `cmd /c dir "${escapedPath}\\${fileName}" /tc`;
          const mtimeOutput = execSync(cmdMtime, { encoding: 'utf8' });
          const mtimeMatch = mtimeOutput.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
          let mtime = new Date();
          if (mtimeMatch) {
            mtime = new Date(parseInt(mtimeMatch[3]), parseInt(mtimeMatch[2]) - 1, parseInt(mtimeMatch[1]), parseInt(mtimeMatch[4]), parseInt(mtimeMatch[5]));
          }
          files.push({
            name: fileName,
            path: fullPath,
            mtime
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