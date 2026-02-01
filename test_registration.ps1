$body = @{
    email     = "testuser777@example.com"
    password  = "password123"
    full_name = "Test User Registration"
    phone     = "9876543210"
    role      = "customer"
} | ConvertTo-Json

Write-Host "Testing registration on production..."
Write-Host "URL: https://darji-pro.onrender.com/api/auth/register"
Write-Host "Body: $body"
Write-Host ""

try {
    $response = Invoke-WebRequest `
        -Uri "https://darji-pro.onrender.com/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    Write-Host $response.Content
    
}
catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response:"
        Write-Host $responseBody
    }
    else {
        Write-Host "Error Message: $($_.Exception.Message)"
    }
}
