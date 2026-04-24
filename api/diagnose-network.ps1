# Script de Diagnóstico - Acesso a Compartilhamento de Rede
$networkPath = "\\192.168.0.247\onedrive\Consolidado"

Write-Host "=== DIAGNÓSTICO DE ACESSO À REDE ===" -ForegroundColor Cyan
Write-Host ""

# 1. Teste de conectividade
Write-Host "1. Testando conectividade ao servidor..." -ForegroundColor Yellow
$hostIP = "192.168.0.247"
$ping = Test-Connection -ComputerName $hostIP -Count 1 -Quiet
if ($ping) {
    Write-Host "   ✓ Servidor está acessível" -ForegroundColor Green
} else {
    Write-Host "   ✗ Servidor NÃO está acessível" -ForegroundColor Red
}

Write-Host ""

# 2. Teste de acesso ao caminho UNC
Write-Host "2. Testando acesso ao caminho UNC..." -ForegroundColor Yellow
Write-Host "   Caminho: $networkPath" -ForegroundColor Cyan
$pathExists = Test-Path $networkPath
if ($pathExists) {
    Write-Host "   ✓ Caminho é acessível" -ForegroundColor Green
} else {
    Write-Host "   ✗ Caminho NÃO é acessível" -ForegroundColor Red
    Write-Host "   Possíveis razões:" -ForegroundColor Yellow
    Write-Host "   - Pasta não existe"
    Write-Host "   - Sem permissão de acesso"
    Write-Host "   - Compartilhamento offline"
}

Write-Host ""

# 3. Listar arquivos na pasta
Write-Host "3. Listando arquivos .xlsm na pasta..." -ForegroundColor Yellow
try {
    $files = @(Get-ChildItem -Path $networkPath -Filter "*.xlsm" -ErrorAction Stop)
    if ($files.Count -gt 0) {
        Write-Host "   ✓ Encontrados $($files.Count) arquivo(s)" -ForegroundColor Green
        $files | ForEach-Object {
            Write-Host "   - $($_.Name) (Modificado: $($_.LastWriteTime))" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ⚠ Nenhum arquivo .xlsm encontrado na pasta" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Erro ao acessar a pasta:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Listar TODOS os arquivos (para debug)
Write-Host "4. Listando TODOS os arquivos na pasta (debug)..." -ForegroundColor Yellow
try {
    $allFiles = @(Get-ChildItem -Path $networkPath -ErrorAction Stop)
    if ($allFiles.Count -gt 0) {
        Write-Host "   Total de itens: $($allFiles.Count)" -ForegroundColor Cyan
        $allFiles | Select-Object -First 10 | ForEach-Object {
            Write-Host "   - $($_.Name)" -ForegroundColor Gray
        }
        if ($allFiles.Count -gt 10) {
            Write-Host "   ... e mais $($allFiles.Count - 10) itens" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠ Pasta está vazia" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Erro ao listar arquivos:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== FIM DO DIAGNÓSTICO ===" -ForegroundColor Cyan
