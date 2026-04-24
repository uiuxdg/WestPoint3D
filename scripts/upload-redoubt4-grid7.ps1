<#!
  Upload Redoubt 4 Grid 7 MP4 to Azure Blob Storage (Azure CLI).

  Prerequisites:
    - winget install Microsoft.AzureCLI (or install Azure CLI)
    - az login
    - Role: Storage Blob Data Contributor (or equivalent) on the account, when using --auth-mode login

  Discover your account and container:
    az storage account list -o table
    az storage container list --account-name <YourAccount> --auth-mode login -o table

  Usage:
    .\scripts\upload-redoubt4-grid7.ps1 -AccountName "mystorage" -ContainerName "mycontainer" -LocalFile "C:\path\Redoubt 4 Grid 7.mp4"

  Then set in .env.local and Vercel:
    NEXT_PUBLIC_REDOUBT4_GRID7_VIDEO_URL=https://<AccountName>.blob.core.windows.net/<ContainerName>/<BlobName>

  For private containers, use a long-lived SAS URL as the env value instead, or enable public read on the blob/container per your policy.
#>
param(
  [Parameter(Mandatory = $true)][string]$AccountName,
  [Parameter(Mandatory = $true)][string]$ContainerName,
  [Parameter(Mandatory = $true)][string]$LocalFile,
  [Parameter(Mandatory = $false)][string]$BlobName = "media/redoubt-4-grid-7.mp4"
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $LocalFile)) {
  Write-Error "Local file not found: $LocalFile"
}

az storage blob upload `
  --account-name $AccountName `
  --container-name $ContainerName `
  --name $BlobName `
  --file $LocalFile `
  --overwrite `
  --auth-mode login

$publicUrl = "https://$AccountName.blob.core.windows.net/$ContainerName/$BlobName"
Write-Host ""
Write-Host "Upload finished. If the blob or container allows anonymous read, use:" -ForegroundColor Green
Write-Host "NEXT_PUBLIC_REDOUBT4_GRID7_VIDEO_URL=$publicUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "If the browser cannot load the video (CORS), add a Blob service CORS rule for your site origin (e.g. http://localhost:3000 and your Vercel URL) with GET and HEAD allowed." -ForegroundColor DarkYellow
