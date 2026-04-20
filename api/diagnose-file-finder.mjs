import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const NETWORK_PATH = 'Z:\\Consolidado';
const DEST_PATH = './data/Centralizador.xlsm';

// Funções do FileFinderService
function getSemanaAtual() {
  const hoje = new Date();
  const dia = hoje.getDate();
  return Math.ceil(dia / 7);
}

function getSemanasAnteriores() {
  const semanas = [];
  for (let i = 5; i >= 1; i--) {
    semanas.push(i);
  }
  return semanas;
}

function getMesesPattern() {
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

function buildSearchPatterns(semanas) {
  const meses = getMesesPattern();
  const ano = new Date().getFullYear();
  const anoStr = String(ano);

  const padroes = [];

  for (const semana of semanas) {
    for (const mes of meses) {
      padroes.push(`Centralizador ${semana} Sem ${mes}*${anoStr}*.xlsm`);
    }
    padroes.push(`Centralizador ${semana} Sem *.xlsm`);
  }

  padroes.push(`Centralizador*.xlsm`);

  return padroes;
}

function patternToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

console.log('=== DIAGNÓSTICO DO FILE FINDER (COM LÓGICA REAL) ===\n');

const semanas = getSemanasAnteriores();
const padroes = buildSearchPatterns(semanas);

console.log(`Semanas a buscar: ${semanas.join(', ')}`);
console.log(`Padrões de busca: ${padroes.length} padrões gerados\n`);

// 1. Listar arquivos
console.log('1. Listando arquivos .xlsm com PowerShell...\n');
console.log(`   Caminho: ${NETWORK_PATH}\n`);
let files = [];
try {
  const ps = `powershell -Command "Get-ChildItem -Path '${NETWORK_PATH}\\*.xlsm' | Select-Object Name, LastWriteTime | ConvertTo-Json"`;

  console.log(`   Comando: ${ps}\n`);

  const output = execSync(ps, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (!output.trim()) {
    console.log('   ✗ Output vazio\n');
  } else {
    const parsed = JSON.parse(output);
    files = Array.isArray(parsed) ? parsed : [parsed];

    console.log(`   ✓ Encontrados ${files.length} arquivo(s):\n`);
    files.forEach(f => {
      if (f.Name.endsWith('.xlsm')) {
        console.log(`   - ${f.Name}`);
      }
    });
    console.log();
  }
} catch (error) {
  console.log(`   ✗ ERRO: ${error.message}\n`);
  process.exit(1);
}

// 2. Procurar usando os padrões (como FileFinderService faz)
console.log('2. Procurando arquivo usando os padrões de busca...\n');
let foundFile = null;

for (const padrao of padroes) {
  const regex = patternToRegex(padrao);
  const matches = files.filter(f => f.Name && f.Name.endsWith('.xlsm') && regex.test(f.Name));

  if (matches.length > 0) {
    console.log(`   ✓ Padrão "${padrao}" encontrou ${matches.length} match(es)`);

    // Ordenar por data (mais recente primeiro)
    matches.sort((a, b) => {
      const dateA = new Date(a.LastWriteTime).getTime();
      const dateB = new Date(b.LastWriteTime).getTime();
      return dateB - dateA;
    });

    foundFile = matches[0];
    console.log(`   ✓ Arquivo selecionado (mais recente): ${foundFile.Name}\n`);
    break;
  }
}

if (!foundFile) {
  console.log('   ✗ Nenhum arquivo encontrado com os padrões\n');
  process.exit(1);
}

// 3. Copiar o arquivo
console.log(`3. Copiando "${foundFile.Name}" para ${DEST_PATH}...\n`);
try {
  const sourceFile = path.join(NETWORK_PATH, foundFile.Name);

  // Criar diretório
  const destDir = path.dirname(DEST_PATH);
  if (!fs.existsSync(destDir)) {
    console.log(`   Criando diretório: ${destDir}`);
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Remover arquivo existente
  if (fs.existsSync(DEST_PATH)) {
    console.log(`   Removendo arquivo existente`);
    fs.unlinkSync(DEST_PATH);
  }

  // Copiar
  console.log(`   Copiando de: ${sourceFile}`);
  console.log(`   Copiando para: ${DEST_PATH}`);
  fs.copyFileSync(sourceFile, DEST_PATH);

  const stats = fs.statSync(DEST_PATH);
  console.log(`   ✓ Sucesso!\n`);
  console.log(`   Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Modificado em: ${stats.mtime}\n`);

  console.log('=== ✓ ARQUIVO COPIADO COM SUCESSO ===');
} catch (copyError) {
  console.log(`   ✗ ERRO ao copiar: ${copyError.message}\n`);
  process.exit(1);
}
