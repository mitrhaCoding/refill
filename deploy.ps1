# Liquid Sort Game - Docker Deployment Script (PowerShell)

Write-Host "🎮 Liquid Sort Game - Docker Deployment" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Build and start the container
Write-Host "🔨 Building and starting the container..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your game is now available at:" -ForegroundColor Cyan
    Write-Host "   http://localhost:8091" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Container status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "📝 To view logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "🛑 To stop: docker-compose down" -ForegroundColor Yellow
    Write-Host "🔄 To restart: docker-compose restart" -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    exit 1
}
