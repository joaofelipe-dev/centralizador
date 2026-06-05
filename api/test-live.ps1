$ErrorActionPreference = "Stop"
$apiDir = "C:\Users\joao.felipe\Desktop\centralizador\api"
Set-Location $apiDir

$logFile = Join-Path $apiDir "server.log"
$errFile = Join-Path $apiDir "server.err"



# Start server
$process = Start-Process -NoNewWindow -FilePath "npx.cmd" -ArgumentList "tsx", "src/server.ts" -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $errFile
Write-Host "Server PID: $($process.Id)"
Start-Sleep 8

# Test server
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3333/docs" -TimeoutSec 5 -UseBasicParsing
    Write-Host "SERVER_OK:$($r.StatusCode)"
} catch {
    Write-Host "SERVER_FAILED:$($_.Exception.Message)"
    Get-Content $errFile -TotalCount 10
    $process.Kill()
    exit 1
}

# Try login
try {
    $body = '{"username":"admin","password":"admin123"}'
    $login = Invoke-RestMethod -Uri "http://localhost:3333/auth/login" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
    Write-Host "LOGIN_OK:$($login.token.Substring(0,30))..."
    $token = $login.token

    # Get stores
    try {
        $stores = Invoke-RestMethod -Uri "http://localhost:3333/stores" -Method Get -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 5
        Write-Host "STORES:$(($stores | Measure-Object).Count)"
    } catch { Write-Host "STORES_FAIL:$($_.Exception.Message)" }

    # Get products
    try {
        $products = Invoke-RestMethod -Uri "http://localhost:3333/products" -Method Get -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 10
        Write-Host "PRODUCTS:$(($products | Measure-Object).Count)"
    } catch { Write-Host "PRODUCTS_FAIL:$($_.Exception.Message)" }

    # Try to create a test order
    if ($stores -and $products -and @($products).Count -gt 0 -and @($stores).Count -gt 0) {
        $orderBody = @{
            storeId = $stores[0].id
            orderDate = "2026-06-05T12:00:00Z"
            items = @(
                @{
                    productId = $products[0].id
                    quantity = 2
                }
            )
        } | ConvertTo-Json -Depth 10
        try {
            $order = Invoke-RestMethod -Uri "http://localhost:3333/orders" -Method Post -Body $orderBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 5
            Write-Host "ORDER_CREATED:$($order.id)"
        } catch { Write-Host "ORDER_FAIL:$($_.Exception.Message)" }
    } else {
        Write-Host "SKIP_ORDER:stores=$(@($stores).Count) products=$(@($products).Count)"
    }

} catch {
    Write-Host "LOGIN_FAIL:$($_.Exception.Message)"
    try {
        $login = Invoke-RestMethod -Uri "http://localhost:3333/api/auth/login" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
        Write-Host "LOGIN_RETRY:$($login | ConvertTo-Json -Compress)"
    } catch {
        Write-Host "LOGIN_FAIL2:$($_.Exception.Message)"
    }
}

$process.Kill()
Write-Host "DONE"
