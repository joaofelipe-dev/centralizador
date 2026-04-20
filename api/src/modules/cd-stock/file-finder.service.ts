import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const DEFAULT_NETWORK_PATH = 'Z:\\Consolidado';

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
      // Verificar se o diretório existe
      console.log(`[FileFinder] Verificando se diretório existe: ${dirPath}`);
      if (!fs.existsSync(dirPath)) {
        console.error(`[FileFinder] ❌ Diretório NÃO existe: ${dirPath}`);
        return files;
      }
      console.log(`[FileFinder] ✓ Diretório existe`);

      const dirPathEscaped = dirPath.replace(/'/g, "''");
      const ps = `powershell -Command "Get-ChildItem -Path '${dirPathEscaped}\\*.xlsm' | Select-Object Name, LastWriteTime | ConvertTo-Json"`;

      console.log(`[FileFinder] Executando PowerShell...`);
      console.log(`[FileFinder] Comando: ${ps}`);

      let output = '';
      let stderr = '';
      try {
        output = execSync(ps, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (execError: any) {
        output = execError.stdout || '';
        stderr = execError.stderr || '';
        console.error(`[FileFinder] Erro ao executar PowerShell: ${execError.message}`);
        if (stderr) {
          console.error(`[FileFinder] Stderr: ${stderr}`);
        }
      }

      console.log(`[FileFinder] Output bruto (${output.length} chars): "${output.substring(0, 100)}..."`);
      console.log(`[FileFinder] Output trimado: "${output.trim()}"`);
      console.log(`[FileFinder] Output length: ${output.trim().length}`);

      if (!output.trim()) {
        console.log(`[FileFinder] ❌ Output vazio - PowerShell retornou vazio`);
        console.log(`[FileFinder] Possíveis causas:`);
        console.log(`[FileFinder]   - Pasta vazia`);
        console.log(`[FileFinder]   - Sem permissão de acesso`);
        console.log(`[FileFinder]   - Caminho incorreto`);
        console.log(`[FileFinder]   - Unidade não mapeada`);
        return files;
      }

      let parsed = JSON.parse(output);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      console.log(`[FileFinder] ✓ JSON parseado com sucesso (${parsed.length} itens)`);
      console.log(`[FileFinder] Items: ${JSON.stringify(parsed, null, 2)}`);

      for (const item of parsed) {
        const fileName = item.Name;
        if (fileName && fileName.endsWith('.xlsm')) {
          const fullPath = path.join(dirPath, fileName);
          const mtimeStr = item.LastWriteTime;
          let mtime = new Date();
          if (mtimeStr) {
            // PowerShell retorna em formato /Date(timestamp)/
            const match = mtimeStr.match(/\/Date\((\d+)\)\//);
            if (match && match[1]) {
              mtime = new Date(parseInt(match[1], 10));
            } else {
              // Fallback para ISO string
              const parsed = new Date(mtimeStr);
              if (!isNaN(parsed.getTime())) {
                mtime = parsed;
              }
            }
          }
          files.push({
            name: fileName,
            path: fullPath,
            mtime
          });
        }
      }
    } catch (error) {
      console.error(`[FileFinder] ❌ ERRO ao listar diretório ${dirPath}:`);
      console.error(`[FileFinder] Error message: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && 'stderr' in error) {
        console.error(`[FileFinder] Stderr: ${(error as any).stderr}`);
      }
      if (error instanceof Error && 'stdout' in error) {
        console.error(`[FileFinder] Stdout: ${(error as any).stdout}`);
      }
      console.error(error);
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

        console.log(`[FileFinder] Testando padrão: "${padrao}" - ${matches.length} match(es)`);

        if (matches.length > 0) {
          console.log(`[FileFinder] ✓ Pattern "${padrao}" matched: ${matches[0].name}`);
          matches.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
          const maisRecente = matches[0];

          console.log(`[FileFinder] ✓ Arquivo encontrado: ${maisRecente.name}`);
          console.log(`[FileFinder] Modificado em: ${maisRecente.mtime}`);

          return {
            success: true,
            file: maisRecente
          };
        }
      }

      console.log(`[FileFinder] ❌ Nenhum padrão fez match. Total de padrões testados: ${padroes.length}`);
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