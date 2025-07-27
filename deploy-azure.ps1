# Liquid Sort Game - Azure Container Apps Deployment Script

param(
    [string]$ResourceGroup = "poland-second-rg",
    [string]$ContainerApp = "liquid-sort-game-capp",
    [string]$Environment = "ls-game-env",
    [string]$RegistryName = "liquidsortregistry",
    [string]$ImageName = "liquid-sort-game",
    [string]$Tag = "latest"
)

Write-Host "🎮 Liquid Sort Game - Azure Deployment" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Yellow
Write-Host "Container App: $ContainerApp" -ForegroundColor Yellow
Write-Host "Registry: $RegistryName" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check Azure CLI login
Write-Host "🔐 Checking Azure CLI authentication..." -ForegroundColor Blue
try {
    $account = az account show --query "name" -o tsv
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Logged in to Azure account: $account" -ForegroundColor Green
} catch {
    Write-Host "❌ Please login to Azure first: az login" -ForegroundColor Red
    exit 1
}

# Step 2: Build the Docker image locally
Write-Host "🔨 Building Docker image..." -ForegroundColor Blue
$localImageTag = "${ImageName}:${Tag}"
docker build -t $localImageTag .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image built successfully: $localImageTag" -ForegroundColor Green

# Step 3: Login to Azure Container Registry
Write-Host "🔑 Logging into Azure Container Registry..." -ForegroundColor Blue
az acr login --name $RegistryName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ACR login failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Successfully logged into ACR: $RegistryName" -ForegroundColor Green

# Step 4: Tag and push image to ACR
Write-Host "📦 Tagging and pushing image to ACR..." -ForegroundColor Blue
$acrImageTag = "${RegistryName}.azurecr.io/${ImageName}:${Tag}"
docker tag $localImageTag $acrImageTag
docker push $acrImageTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Image pushed successfully: $acrImageTag" -ForegroundColor Green

# Step 5: Update Container App with new image
Write-Host "🚀 Updating Container App..." -ForegroundColor Blue
az containerapp update `
    --name $ContainerApp `
    --resource-group $ResourceGroup `
    --image $acrImageTag `
    --set-env-vars "NGINX_HOST=0.0.0.0" "NGINX_PORT=80"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Container App update failed" -ForegroundColor Red
    exit 1
}

# Step 6: Get the app URL
Write-Host "🌐 Getting application URL..." -ForegroundColor Blue
$appUrl = az containerapp show --name $ContainerApp --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv

if ($appUrl) {
    Write-Host ""
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your Liquid Sort Game is now available at:" -ForegroundColor Cyan
    Write-Host "   https://$appUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Container App details:" -ForegroundColor Cyan
    az containerapp show --name $ContainerApp --resource-group $ResourceGroup --query "{name:name,url:properties.configuration.ingress.fqdn,state:properties.runningStatus}" -o table
} else {
    Write-Host "⚠️  Deployment completed but couldn't retrieve app URL" -ForegroundColor Yellow
    Write-Host "   Check Azure portal for the Container App URL" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs: az containerapp logs show --name $ContainerApp --resource-group $ResourceGroup --follow" -ForegroundColor White
Write-Host "   View revisions: az containerapp revision list --name $ContainerApp --resource-group $ResourceGroup -o table" -ForegroundColor White
Write-Host "   Scale app: az containerapp update --name $ContainerApp --resource-group $ResourceGroup --min-replicas 1 --max-replicas 3" -ForegroundColor White
