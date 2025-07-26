# PowerShell script to sync version.ver with package.json

$packagePath = Join-Path $PSScriptRoot "..\package.json"
$versionPath = Join-Path $PSScriptRoot "..\version.ver"

try {
    # Read package.json
    $packageContent = Get-Content -Path $packagePath -Raw | ConvertFrom-Json
    $version = $packageContent.version
    
    # Write to version.ver
    Set-Content -Path $versionPath -Value $version -NoNewline
    
    Write-Host "Version synced successfully: $version"
    Write-Host "Updated $versionPath"
} catch {
    Write-Error "Failed to sync version: $_"
    exit 1
}
