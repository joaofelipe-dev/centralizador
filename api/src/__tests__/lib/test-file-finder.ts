import { FileFinderService } from '../../modules/cd-stock/file-finder.service.js';

async function testFileFinder() {
  console.log('=== Testando FileFinderService ===\n');

  const finder = new FileFinderService();

  console.log('Procurando arquivo...\n');
  const result = await finder.findFile();

  console.log('\n=== Resultado ===');
  console.log(JSON.stringify(result, null, 2));

  if (result.success && result.file) {
    console.log(`\n✓ Arquivo encontrado: ${result.file.name}`);
    console.log(`  Path: ${result.file.path}`);
    console.log(`  Modificado em: ${result.file.mtime}`);

    // Validações
    console.log('\n=== Validações ===');

    // 1. Nome segue o padrão esperado?
    const namePattern = /^Centralizador\s+\d+\s+Sem\s+.*\.xlsm$/i;
    if (namePattern.test(result.file.name)) {
      console.log(`✓ Nome segue padrão: ${result.file.name}`);
    } else {
      console.log(`⚠ Nome não segue padrão esperado: ${result.file.name}`);
    }

    // 2. Data foi parseada corretamente?
    if (result.file.mtime instanceof Date && !isNaN(result.file.mtime.getTime())) {
      console.log(`✓ Data parseada corretamente: ${result.file.mtime.toISOString()}`);
    } else {
      console.log(`✗ Erro: Data inválida`);
    }

    // 3. Path é acessível?
    if (result.file.path.includes('.xlsm')) {
      console.log(`✓ Path válido: ${result.file.path}`);
    } else {
      console.log(`✗ Path inválido: ${result.file.path}`);
    }
  } else {
    console.log(`\n✗ Erro: ${result.error}`);
  }
}

testFileFinder().catch(console.error);
