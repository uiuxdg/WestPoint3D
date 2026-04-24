<#!
  Upload Fort Clinton GPR MP4 to Azure Blob Storage (Azure CLI).

  Prerequisites:
    - Azure CLI installed, `az login`
    - Role: Storage Blob Data Contributor (or equivalent) when using --auth-mode login

  Usage:
    .\scripts\upload-fort-clinton-gpr.ps1 -AccountName "mystorage" -ContainerName "mycontainer" -LocalFile "C:\Users\dante\Downloads\Fort Clinton GPR.mp4"

  Then set in .env.local and Vercel (prefer server-only; restart dev after change):
    FORT_CLINTON_GPR_VIDEO_URL=https://<AccountName>.blob.core.windows.net/<ContainerName>/<BlobName>
  Or NEXT_PUBLIC_FORT_CLINTON_GPR_VIDEO_URL for a public blob URL.

  Use the same container as other West Point media if you prefer one bucket.
#>
param(
  [Parameter(Mandatory = $true)][string]$AccountName,
  [Parameter(Mandatory = $true)][string]$ContainerName,
  [Parameter(Mandatory = $true)][string]$LocalFile,
  [Parameter(Mandatory = $false)][string]$BlobName = "media/fort-clinton-gpr.mp4"
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
  --content-type "video/mp4" `
  --overwrite `
  --auth-mode login

$publicUrl = "https://$AccountName.blob.core.windows.net/$ContainerName/$BlobName"
Write-Host ""
Write-Host "Upload finished. Set one of:" -ForegroundColor Green
Write-Host "FORT_CLINTON_GPR_VIDEO_URL=$publicUrl" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_FORT_CLINTON_GPR_VIDEO_URL=$publicUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "If playback fails in the browser, add Blob CORS for this app origin (GET, HEAD)." -ForegroundColor DarkYellow
