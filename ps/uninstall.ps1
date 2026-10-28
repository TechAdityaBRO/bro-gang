param(
  [Parameter(Mandatory)] [string]$DestDir,
  [Parameter(Mandatory)] [string]$ShimDir,
  [Parameter(Mandatory)] [string]$PkgName
)
$ErrorActionPreference = 'SilentlyContinue'
if (Test-Path $DestDir) { Remove-Item $DestDir -Recurse -Force }
Get-ChildItem -Path $ShimDir -Filter '*.cmd' | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  if ($content -like "*$DestDir*") { Remove-Item $_.FullName -Force; Write-Host "  removed shim $($_.Name)" }
}
$parent = Split-Path $DestDir -Parent
if ((Test-Path $parent) -and -not (Get-ChildItem $parent)) { Remove-Item $parent -Force }
Write-Host "  $PkgName removed"
