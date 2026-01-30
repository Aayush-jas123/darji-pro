# Test the API with sample requests

Write-Host "🧪 Testing Darji Pro API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"

# Test 1: Health Check
Write-Host "1️⃣ Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Version: $($health.version)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Register a user
Write-Host "2️⃣ Registering test user..." -ForegroundColor Yellow
$registerData = @{
    email     = "testuser@example.com"
    password  = "testpass123"
    full_name = "Test User"
    role      = "customer"
} | ConvertTo-Json

try {
    $user = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✅ User registered successfully" -ForegroundColor Green
    Write-Host "   User ID: $($user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($user.email)" -ForegroundColor Gray
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  User already exists (expected if running multiple times)" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Registration failed: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Login
Write-Host "3️⃣ Logging in..." -ForegroundColor Yellow
$loginData = @{
    email    = "testuser@example.com"
    password = "testpass123"
} | ConvertTo-Json

try {
    $tokens = Invoke-RestMethod -Uri "$baseUrl/api/auth/login/json" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Access Token: $($tokens.access_token.Substring(0, 20))..." -ForegroundColor Gray
    $accessToken = $tokens.access_token
}
catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Get current user
Write-Host "4️⃣ Getting current user info..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $accessToken"
}

try {
    $currentUser = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Retrieved user info" -ForegroundColor Green
    Write-Host "   Name: $($currentUser.full_name)" -ForegroundColor Gray
    Write-Host "   Role: $($currentUser.role)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed to get user info: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: List branches
Write-Host "5️⃣ Listing branches..." -ForegroundColor Yellow
try {
    $branches = Invoke-RestMethod -Uri "$baseUrl/api/branches" -Method Get
    Write-Host "✅ Retrieved branches" -ForegroundColor Green
    Write-Host "   Total branches: $($branches.Count)" -ForegroundColor Gray
    foreach ($branch in $branches) {
        Write-Host "   - $($branch.name) ($($branch.code))" -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ Failed to list branches: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 API testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 View full API documentation at: $baseUrl/docs" -ForegroundColor Cyan
